export async function fetchGithubRepo(repoUrl: string): Promise<string> {
  // Extract owner + repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error("Invalid GitHub repo URL");

  const owner = match[1];
  const repo = match[2].replace(".git", "");

  // 1. Get default branch
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoRes.ok) throw new Error("Failed to fetch repository info");
  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch;

  // 2. Get recursive tree
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
  if (!treeRes.ok) throw new Error("Failed to fetch repository tree");
  const treeData = await treeRes.json();

  // 3. Filter for code files
  const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.html', '.css', '.rb', '.go', '.rs', '.php'];
  const codeFiles = treeData.tree.filter((file: any) => 
    file.type === 'blob' && 
    codeExtensions.some(ext => file.path.endsWith(ext)) &&
    !file.path.includes('node_modules') &&
    !file.path.includes('dist') &&
    !file.path.includes('build') &&
    !file.path.includes('.next')
  );

  if (codeFiles.length === 0) {
    throw new Error("No code files found in the repository");
  }

  // Limit to top 15 files to avoid exceeding token limits or rate limits
  const filesToFetch = codeFiles.slice(0, 15);
  
  let combinedCode = `// Repository: ${owner}/${repo}\n\n`;

  // 4. Fetch raw contents
  await Promise.all(filesToFetch.map(async (file: any) => {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;
      const rawRes = await fetch(rawUrl);
      if (rawRes.ok) {
        const content = await rawRes.text();
        combinedCode += `\n\n// --- File: ${file.path} ---\n${content}`;
      }
    } catch (e) {
      console.error(`Failed to fetch ${file.path}`);
    }
  }));

  return combinedCode;
}
