import connectDB from '../lib/db';
import Resolution from '../models/Resolution';
import { jsonError, jsonSuccess } from '../lib/response';
import { checkFields, getBlockedMessage } from '../lib/contentModeration';

export async function getResolutions(req, res) {
  try {
    await connectDB();
    const resolutions = await Resolution.find({ user: req.user._id }).sort({ createdAt: -1 });
    return jsonSuccess(res, 200, 'Resolutions fetched successfully', { resolutions });
  } catch (err) {
    return jsonError(res, 500, 'Failed to fetch resolutions', err.message);
  }
}

export async function createResolution(req, res) {
  try {
    await connectDB();
    const { title, description, category, reminderFrequency, notificationEnabled, targetDate } = req.body;
    
    if (!title) {
      return jsonError(res, 400, 'Title is required');
    }

    const moderation = checkFields({ title: title.trim(), description: description || '' });
    if (moderation.blocked) {
      return jsonError(res, 400, getBlockedMessage(), 'CONTENT_BLOCKED');
    }

    const resolution = await Resolution.create({
      user: req.user._id,
      title,
      description,
      category,
      reminderFrequency,
      notificationEnabled,
      targetDate,
    });

    return jsonSuccess(res, 201, 'Resolution created successfully', { resolution });
  } catch (err) {
    return jsonError(res, 500, 'Failed to create resolution', err.message);
  }
}

export async function updateResolution(req, res) {
  try {
    await connectDB();
    const { id } = req.query;
    
    let resolution = await Resolution.findOne({ _id: id, user: req.user._id });
    
    if (!resolution) {
      return jsonError(res, 404, 'Resolution not found');
    }

    const updates = req.body;
    // Prevent updating user field
    delete updates.user;
    delete updates._id;

    const textToCheck = {
      title: updates.title !== undefined ? updates.title : resolution.title,
      description: updates.description !== undefined ? updates.description : resolution.description,
    };
    const updateModeration = checkFields(textToCheck);
    if (updateModeration.blocked) {
      return jsonError(res, 400, getBlockedMessage(), 'CONTENT_BLOCKED');
    }

    resolution = await Resolution.findByIdAndUpdate(id, { ...updates, updatedAt: Date.now() }, { new: true, runValidators: true });

    return jsonSuccess(res, 200, 'Resolution updated successfully', { resolution });
  } catch (err) {
    return jsonError(res, 500, 'Failed to update resolution', err.message);
  }
}

export async function deleteResolution(req, res) {
  try {
    await connectDB();
    const { id } = req.query;
    
    const resolution = await Resolution.findOneAndDelete({ _id: id, user: req.user._id });
    
    if (!resolution) {
      return jsonError(res, 404, 'Resolution not found');
    }

    return jsonSuccess(res, 200, 'Resolution deleted successfully');
  } catch (err) {
    return jsonError(res, 500, 'Failed to delete resolution', err.message);
  }
}

