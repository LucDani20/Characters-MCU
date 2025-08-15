import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true    
}));

app.use(express.json());

app.get("/characters", async (req, res) => {
    try {
        const data = await readFile("./persons.json", "utf-8");
        const jsonData = JSON.parse(data);
        res.status(200).json(jsonData.persons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/characters", async (req, res) => {
    try {
        const newCharacter = req.body;
        const data = await readFile("./persons.json", "utf-8");
        const jsonData = JSON.parse(data);
        
        // Générer un nouvel ID
        newCharacter.id = jsonData.persons.length > 0 
            ? Math.max(...jsonData.persons.map(p => p.id)) + 1 
            : 1;
            
        jsonData.persons.push(newCharacter);
        
        await writeFile("./persons.json", JSON.stringify(jsonData, null, 2), "utf-8");
        res.status(201).json(newCharacter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Route pour modifier un personnage
app.put("/characters/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updatedCharacter = req.body;
        
        const data = await readFile("./persons.json", "utf-8");
        const jsonData = JSON.parse(data);
        
        const index = jsonData.persons.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: "Character not found" });
        }
        
        // Conserver le même ID
        updatedCharacter.id = id;
        jsonData.persons[index] = updatedCharacter;
        
        await writeFile("./persons.json", JSON.stringify(jsonData, null, 2), "utf-8");
        res.status(200).json(updatedCharacter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Route pour supprimer un personnage
app.delete("/characters/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        const data = await readFile("./persons.json", "utf-8");
        const jsonData = JSON.parse(data);
        
        const index = jsonData.persons.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: "Character not found" });
        }
        
        const deletedCharacter = jsonData.persons.splice(index, 1)[0];
        
        await writeFile("./persons.json", JSON.stringify(jsonData, null, 2), "utf-8");
        res.status(200).json(deletedCharacter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default app;