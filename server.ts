import express from "express";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from "cookie-parser";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB Schema
interface IUser {
  githubId: string;
  growthData: any;
  radarData: any;
}

let dbClient: MongoClient | null = null;
let db: any = null;
let usersCollection: any = null;

let isDbConnected = false;
const inMemoryUsers = new Map<string, any>();

const app = express();
const PORT = 3000;
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  dbClient = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  dbClient.connect().then(async () => {
    db = dbClient!.db("portfolio_path");
    usersCollection = db.collection("users");
    await db.command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    isDbConnected = true;
  }).catch((err) => {
    console.error("MongoDB connection error:", err);
    console.warn("Falling back to in-memory storage.");
  });
} else {
  console.warn("MONGODB_URI not set. Using in-memory storage.");
}

// Test Mongo Endpoint
app.post("/api/test-mongo", async (req, res) => {
  const { uri, data } = req.body;
  
  if (!uri) {
    return res.status(400).json({ success: false, error: "MongoDB URI is required" });
  }

  let client;
  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    await client.connect();
    
    const testDb = client.db("portfolio_path");
    const collection = testDb.collection("test_collection");
    
    const result = await collection.insertOne({
      ...data,
      timestamp: new Date()
    });
    
    res.json({ 
      success: true, 
      message: "Successfully connected and inserted document!",
      insertedId: result.insertedId 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to connect to MongoDB" 
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// DB Status Route
app.get("/api/db-status", (req, res) => {
  res.json({ connected: isDbConnected });
});

// GitHub OAuth Routes
app.get("/api/auth/url", (req, res) => {
  const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID || "",
    redirect_uri: redirectUri,
    scope: "repo read:user",
  });
  res.json({ url: `https://github.com/login/oauth/authorize?${params.toString()}` });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    res.status(400).send("No code provided");
    return;
  }

  try {
    const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    res.cookie("github_token", tokenData.access_token, {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.send(`
      <html>
        <body>
          <script>
            // Try to use localStorage as a fallback for cross-window communication
            try {
              localStorage.setItem('oauth_success', Date.now().toString());
            } catch (e) {
              console.error('localStorage error:', e);
            }
            
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              // If opener is lost, try to close anyway, or redirect
              window.close();
              // Fallback if close fails (e.g., not opened by script)
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1000);
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).send("Authentication failed");
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("github_token", {
    secure: true,
    sameSite: "none",
    httpOnly: true,
  });
  res.json({ success: true });
});

app.get("/api/github/user", async (req, res) => {
  const token = req.cookies.github_token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.get("/api/github/repositories", async (req, res) => {
  const token = req.cookies.github_token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch repositories");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// User Data Routes (MongoDB)
app.get("/api/user/data", async (req, res) => {
  const token = req.cookies.github_token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Get user ID from GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!userRes.ok) throw new Error("Failed to fetch user from GitHub");
    const userData = await userRes.json();
    const githubId = userData.id.toString();

    let user;
    if (isDbConnected && usersCollection) {
      user = await usersCollection.findOne({ githubId });
      if (!user) {
        const newUser = { githubId, growthData: [], radarData: null };
        await usersCollection.insertOne(newUser);
        user = newUser;
      }
    } else {
      user = inMemoryUsers.get(githubId);
      if (!user) {
        user = { githubId, growthData: [], radarData: null };
        inMemoryUsers.set(githubId, user);
      }
    }

    res.json({
      growthData: user.growthData,
      radarData: user.radarData
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

app.post("/api/user/data", async (req, res) => {
  const token = req.cookies.github_token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Get user ID from GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!userRes.ok) throw new Error("Failed to fetch user from GitHub");
    const userData = await userRes.json();
    const githubId = userData.id.toString();

    const { growthData, radarData } = req.body;
    
    const updateData: any = {};
    if (growthData !== undefined) updateData.growthData = growthData;
    if (radarData !== undefined) updateData.radarData = radarData;

    let user;
    if (isDbConnected && usersCollection) {
      const result = await usersCollection.findOneAndUpdate(
        { githubId },
        { $set: updateData },
        { returnDocument: 'after', upsert: true }
      );
      user = result;
    } else {
      user = inMemoryUsers.get(githubId);
      if (!user) {
        user = { githubId, growthData: [], radarData: null };
      }
      if (growthData !== undefined) user.growthData = growthData;
      if (radarData !== undefined) user.radarData = radarData;
      inMemoryUsers.set(githubId, user);
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ error: "Failed to save user data" });
  }
});

// GitHub API Routes
app.get("/api/github/contents", async (req, res) => {
  try {
    const { url } = req.query;
    const token = req.cookies.github_token;
    
    if (!url || typeof url !== 'string') {
       res.status(400).json({ error: "Missing or invalid 'url' query parameter" });
       return;
    }

    // Parse GitHub URL: https://github.com/owner/repo
    // or https://github.com/owner/repo/tree/branch/path
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)\/?(.*))?/);
    if (!match) {
       res.status(400).json({ error: "Invalid GitHub repository URL" });
       return;
    }

    const [, owner, repo, branch, path] = match;
    const apiPath = path ? path : '';
    const ref = branch ? `?ref=${branch}` : '';
    
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${apiPath}${ref}`;

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PortfolioPath-App'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("GitHub API Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch GitHub contents" });
  }
});

app.get("/api/github/raw", async (req, res) => {
  try {
    const { url } = req.query;
    const token = req.cookies.github_token;
    
    if (!url || typeof url !== 'string') {
       res.status(400).json({ error: "Missing or invalid 'url' query parameter" });
       return;
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch raw content: ${response.statusText}`);
    }

    const text = await response.text();
    res.send(text);
  } catch (error: any) {
    console.error("Raw Content Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch raw content" });
  }
});

// Only start the server if we are NOT on Vercel
async function startServer() {
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static("dist"));
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

// Export the app for Vercel serverless functions
export default app;
