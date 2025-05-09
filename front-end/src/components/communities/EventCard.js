import React from 'react';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  
  return (
    <div className={`border rounded-lg p-4 ${isUpcoming ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {format(eventDate, 'PPP')} at {format(eventDate, 'p')}
          </p>
          <p className="text-gray-700">{event.description}</p>
        </div>
        
        {isUpcoming && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Upcoming
          </span>
        )}
      </div>
    </div>
  );
};

export default EventCard;
