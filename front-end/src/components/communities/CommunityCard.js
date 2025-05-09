import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CommunityCard = ({ community }) => {
  const { user } = useAuth();
  const isMember = community.members.some(member => member._id === user?._id);
  const isCreator = community.creator._id === user?._id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-indigo-100 hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold mb-1 truncate">
            <Link to={`/communities/${community._id}`} className="text-indigo-900 hover:text-teal-600">
              {community.name}
            </Link>
          </h3>
          {community.isPrivate && (
            <span className="bg-indigo-100 text-indigo-900 text-xs px-2 py-1 rounded-full">
              Private
            </span>
          )}
        </div>
        
        <p className="text-indigo-600 text-sm line-clamp-2 mb-3">
          {community.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {community.tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-indigo-100 text-indigo-900 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-sm text-indigo-600">
          <div className="flex items-center gap-1">
            <span>{community.members.length} members</span>
          </div>
          
          <div>
            {community.events.length > 0 && (
              <span className="ml-2">{community.events.length} events</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 px-5 py-3 border-t border-indigo-100 flex justify-between items-center">
        <div className="text-sm text-indigo-600">
          Created by {community.creator.username}
        </div>
        
        <div>
          {isCreator ? (
            <Link 
              to={`/communities/${community._id}/edit`}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              Manage
            </Link>
          ) : isMember ? (
            <Link 
              to={`/communities/${community._id}`}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              View
            </Link>
          ) : (
            <Link 
              to={`/communities/${community._id}`}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              Join
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;