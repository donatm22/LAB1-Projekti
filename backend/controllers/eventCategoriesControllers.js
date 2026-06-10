const db = require("../config/prisma");
const { isLettersOnly, trimString } = require("../utils/validation");

const getEventCategories = async (req, res) => {
  try {
    const categories = await db.eventCategories.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventCategoriesById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await db.eventCategories.findUnique({
            where: { id: String(id) }
        });

        if (!category) {
            return res.status(404).json({ message: "Kategoria e eventit nuk u gjet" });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEventCategories = async (req, res) => {
    try {
        const { emri } = req.body;
        if (!emri) return res.status(400).json({ message: "Emri nuk eshte plotesuar!" });
        if (!isLettersOnly(emri)) {
            return res.status(400).json({ message: "Emri i kategorise duhet te permbaje vetem shkronja" });
        }

        const newCategory = await db.eventCategories.create({
            data: { emri: trimString(emri) }
        });

        res.status(201).json({
            message: "Kategoria e Eventit u shtua me sukses!",
            eventCategories: newCategory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateEventCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const { emri } = req.body;

        if (!emri) return res.status(400).json({ message: "Emri eshte i detyrueshem!" });
        if (!isLettersOnly(emri)) {
            return res.status(400).json({ message: "Emri i kategorise duhet te permbaje vetem shkronja" });
        }

        const updatedCategory = await db.eventCategories.update({
            where: { id: String(id) },
            data: { emri: trimString(emri) }
        });

        res.status(200).json({
            message: "Kategoria u perditesua me sukses",
            eventCategories: updatedCategory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEventCategories = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user?.roli === "organizer") {
            return res.status(403).json({ message: "Access denied. Only admins can delete categories." });
        }

        await db.eventCategories.delete({
            where: { id: String(id) }
        });

        res.status(200).json({ message: "Kategoria e Eventit eshte fshire me sukses" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getEventCategories,
    getEventCategoriesById,
    createEventCategories,
    updateEventCategories,
    deleteEventCategories
};
