const dotenv=require("dotenv")
dotenv.config();
 // Add this in your .env file


module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRE: '30d',
    BID_ENTRY_FEE: 10, // $10 refundable entry fee
    AUCTION_EXPIRE_HOURS: 24, // 24 hours auction duration
    SOCKET_EVENTS: {
      NEW_BID: 'new_bid',
      AUCTION_END: 'auction_end',
      NEW_MESSAGE: 'new_message',
      NOTIFICATION: 'notification'
    }

  };
