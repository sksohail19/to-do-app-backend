const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const List = require("../models/ListSchema");
const router = express.Router();

router.post("/add", [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('status').isIn(['In Progress', 'Completed', 'Cancelled', 'Backlog']),
    body('priority').isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of low, medium, or high'),
    body('expireDate').optional().isISO8601().withMessage('Expire date must be a valid date'),
    body('time').optional().isString().withMessage('Time must be a string')
], fetchUser, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, type, status, priority, expireDate } = req.body;
        const existingList = await List.findOne({ title,userId: req.user.userId });
        if (existingList) {
            return res.status(400).json({ error: 'List item with this title already exists' });
        }
        const userId = req.user.userId;
        const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const newList = await new List({
            title,
            description,
            type,
            status,
            priority,
            taskId,
            userId,
            expireDate: expireDate ? new Date(expireDate) : null,
            time: req.body.time || null
        });

        await newList.save();
        res.status(201).json({ message: 'List item added successfully', list: newList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put("/update/:id", fetchUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, status, priority, expireDate, time } = req.body;
        const listItem = await List.findOne({ taskId: id, userId: req.user.userId });
        if (!listItem.userId.equals(req.user.userId)) {
            return res.status(403).json({ error: 'Unauthorized to update this list item' });
        }
        if (!listItem) {
            return res.status(404).json({ error: 'List item not found' });
        }

        listItem.title = title || listItem.title;
        listItem.description = description || listItem.description;
        listItem.type = type || listItem.type;
        listItem.status = status || listItem.status;
        listItem.priority = priority || listItem.priority;
        listItem.expireDate = expireDate ? new Date(expireDate) : listItem.expireDate;
        listItem.time = time || listItem.time; // Assuming you want to update time as well
        await listItem.save();
        res.status(200).json({ message: 'List item updated successfully', list: listItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete("/delete/:id", fetchUser, async (req, res) => {
    try {
        const id = req.params.id;
        //console.log(id);
        const listItem = await List.findById({ _id: id, userId: req.user.userId });
        if (!listItem) {
            return res.status(404).json({ error: 'List item not found' });
        }
        if (!listItem.userId.equals(req.user.userId)) {
            return res.status(403).json({ error: 'Unauthorized to delete this list item' });
        }

        await List.deleteOne({ _id: id, userId: req.user.userId });
        res.status(200).json({ message: 'List item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/getall", fetchUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const lists = await List.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }  
}); 

router.get("/get/:id", fetchUser, async (req, res) => {
    try {
        const { id } = req.params;
        const listItem = await List.findOne({ taskId: id, userId: req.user.userId });
        if (!listItem) {
            return res.status(404).json({ error: 'List item not found' });
        }
        res.status(200).json(listItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;