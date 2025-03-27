import mongoose from 'mongoose';
import Message from './models/Message.js';
import User from './models/User.js'; // Assuming user details are stored in a User model
import { WhatsAppInstances } from './whatsappInstances.js'; // Assuming you have WhatsAppInstances configured

// Function to send a message
async function sendMessage(message) {
  try {
    console.log(`Sending message to ${message.id}: ${message.message}`);

    // Extract tokenId (instance ID)
    const tokenId = message.tokenId;
    const delay = message.options?.delay || 0;

    let data;
    if (message.url) {
      data = await WhatsAppInstances[tokenId].sendMediaFile(message, 'url');
    } else {
      data = await WhatsAppInstances[tokenId].sendTextMessage(message);
    }

    console.log(`Message sent: ${data}`);
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));

    await Message.updateOne({ _id: message._id }, { status: 'sent' });

  } catch (error) {
    console.error(`Failed to send message: ${error}`);
    await Message.updateOne({ _id: message._id }, { status: 'failed' });
  }
}

// Function to process messages for a specific instance
async function processInstanceMessages(instanceId) {
  // Get message sending limit for this instance from User table
  const user = await User.findOne({ "insdetails.tokenId": instanceId });
  const messageLimit = user?.insdetails?.messageQty || 1000; // Default to 1000 if not set
  const batchSize = Math.floor(messageLimit / 60); // Messages per minute

  console.log(`Processing ${batchSize} messages for instance: ${instanceId}`);

  const messages = await Message.find({ tokenId: instanceId, status: 'pending' })
                                .limit(batchSize)
                                .sort({ createdAt: 1 });

  for (const msg of messages) {
    await sendMessage(msg);
  }
}

// Scheduler to process messages every minute
setInterval(async () => {
  console.log("Running message queue processing...");

  // Get all unique instances with pending messages
  const instances = await Message.distinct('tokenId', { status: 'pending' });

  for (const instanceId of instances) {
    processInstanceMessages(instanceId);
  }

}, 60000); // Runs every 60 seconds (1 minute)
