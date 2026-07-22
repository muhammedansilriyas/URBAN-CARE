import Message from '../models/Message.js';

// @desc    Get all contact messages
// @route   GET /api/messages
// @access  Private/Admin
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for logged-in patient
// @route   GET /api/messages/patient
// @access  Private
export const getPatientMessages = async (req, res) => {
  try {
    const messages = await Message.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a contact/feedback message
// @route   POST /api/messages
// @access  Public
export const createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const newMessage = await Message.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a contact message
// @route   PUT /api/messages/:id/reply
// @access  Private/Admin
export const replyMessage = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage) {
      return res.status(400).json({ message: 'Please provide a reply message' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isReplied = true;
    message.replyMessage = replyMessage;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
