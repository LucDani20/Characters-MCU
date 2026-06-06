import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, 'persons.json');

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true    
}));

app.use(express.json());

app.get("/characters", async (req, res) => {
    try {
        const data = await readFile(DATA_PATH, "utf-8");
        const jsonData = JSON.parse(data);
        res.status(200).json(jsonData.persons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/characters", async (req, res) => {
    try {
        const { name, realName, universe } = req.body;

        if (!name?.trim() || !universe?.trim()) {
            return res.status(400).json({ error: "Les champs 'name' et 'universe' sont requis" });
        }

        const data = await readFile(DATA_PATH, "utf-8");
        const jsonData = JSON.parse(data);
        
        const newCharacter = {
            id: jsonData.persons.length > 0 
                ? Math.max(...jsonData.persons.map(p => p.id)) + 1 
                : 1,
            name: name.trim(),
            realName: realName?.trim() || "",
            universe: universe.trim()
        };
            
        jsonData.persons.push(newCharacter);
        
        await writeFile(DATA_PATH, JSON.stringify(jsonData, null, 2), "utf-8");
        res.status(201).json(newCharacter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.put("/characters/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, realName, universe } = req.body;

        if (!name?.trim() || !universe?.trim()) {
            return res.status(400).json({ error: "Les champs 'name' et 'universe' sont requis" });
        }

        const data = await readFile(DATA_PATH, "utf-8");
        const jsonData = JSON.parse(data);
        
        const index = jsonData.persons.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: "Character not found" });
        }
        
        jsonData.persons[index] = {
            id,
            name: name.trim(),
            realName: realName?.trim() || "",
            universe: universe.trim()
        };
        
        await writeFile(DATA_PATH, JSON.stringify(jsonData, null, 2), "utf-8");
        res.status(200).json(jsonData.persons[index]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/characters/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        const data = await readFile(DATA_PATH, "utf-8");
        const jsonData = JSON.parse(data);
        
        const index = jsonData.persons.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: "Character not found" });
        }
        
        const deletedCharacter = jsonData.persons.splice(index, 1)[0];
        
        await writeFile(DATA_PATH, JSON.stringify(jsonData, null, 2), "utf-8");
        res.status(200).json(deletedCharacter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default app;