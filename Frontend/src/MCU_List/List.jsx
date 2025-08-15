import { useState, useEffect } from "react";

const List = () => {
    const [persons, setPersons] = useState([]);
    const [id, setID] = useState("");
    const [name, setName] = useState("");
    const [universe, setUniverse] = useState("");
    const PORT = 4000;
    const Url = "http://localhost:" + PORT;
    
    const [confirmationSuppre, setConfirmationSuppre] = useState(false);
    const [modification, setModification] = useState(false);
    const [suppreID, setSuppreID] = useState(null);

    useEffect(() => {
        const dataFetch = async () => {
            try {
                const response = await fetch(Url + "/characters");
                const info = await response.json();
                setPersons(info);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        dataFetch();
    }, []);

    const startEdit = () => {
        setID("");
        setName("");
        setUniverse("");
    };

    const submit = async () => {
        const modifyPerson = {id, name, universe};
        try {
            const changePerson = await fetch(`${Url}/characters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(modifyPerson)
            });
            const data = await changePerson.json();
            setPersons(data);
            startEdit();
            setModification(false);
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    const btNewPerson = async () => {
        const newPerson = {name, universe};
        try {
            const addPerson = await fetch(`${Url}/characters`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(newPerson)
            });
            const data = await addPerson.json();
            setPersons([...persons, data]);
            startEdit();
        } catch (err) {
            console.error("Create error:", err);
        }
    };

    const modify = (personId) => {
        const person = persons.find(p => p.id === personId);
        if (person) {
            setModification(true);
            setID(person.id);
            setName(person.name);
            setUniverse(person.universe);
        } else {
            console.log("Personnage non trouvé");
        }
    };

    const btSuppre = async (pID) => {
        try {
            await fetch(`${Url}/characters/${pID}`, {
                method: "DELETE"
            });
            // Rafraîchir la liste après suppression
            const response = await fetch(Url + "/characters");
            const updatedList = await response.json();
            setPersons(updatedList);
            setConfirmationSuppre(false);
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Liste Des MCU</h1>
            
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">
                    {modification ? "Modifier" : "Ajouter"} un personnage
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                        <label className="block mb-1">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Univers</label>
                        <input
                            type="text"
                            value={universe}
                            onChange={(e) => setUniverse(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>
                <button
                    onClick={modification ? submit : btNewPerson}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                    {modification ? "Mettre à jour" : "Ajouter"}
                </button>
                {modification && (
                    <button
                        onClick={startEdit}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Annuler
                    </button>
                )}
            </div>

            {/* Tableau */}
            <table className="min-w-full bg-white border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="py-2 px-4 border">ID</th>
                        <th className="py-2 px-4 border">Nom</th>
                        <th className="py-2 px-4 border">Univers</th>
                        <th className="py-2 px-4 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {persons.map((person) => (
                        <tr key={person.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border">{person.id}</td>
                            <td className="py-2 px-4 border">{person.name}</td>
                            <td className="py-2 px-4 border">{person.universe}</td>
                            <td className="py-2 px-4 border">
                                <button
                                    onClick={() => modify(person.id)}
                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => {
                                        setSuppreID(person.id);
                                        setConfirmationSuppre(true);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {confirmationSuppre && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p className="mb-4">Voulez-vous vraiment supprimer définitivement?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => btSuppre(suppreID)}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                OUI
                            </button>
                            <button
                                onClick={() => setConfirmationSuppre(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                NON
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default List;