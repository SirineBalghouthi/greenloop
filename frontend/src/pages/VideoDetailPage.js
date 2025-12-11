import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { 
  Play, 
  Heart, 
  Share2, 
  ArrowLeft,
  Eye,
  Clock,
  Download
} from 'lucide-react';

const VideoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, API_URL } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/videos/${id}`);
      setVideo(response.data.video);
    } catch (error) {
      console.error('Erreur chargement vidéo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(`${API_URL}/videos/${id}/like`);
      loadVideo();
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const handleShare = async () => {
    try {
      await axios.post(`${API_URL}/videos/${id}/share`);
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papier!');
      }
      loadVideo();
    } catch (error) {
      console.error('Erreur share:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vidéo non trouvée</h2>
          <button
            onClick={() => navigate('/videos')}
            className="text-green-600 hover:text-green-700"
          >
            Retour aux vidéos
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/videos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux vidéos
        </button>

        {/* Video Player or Image */}
        <div className="bg-black rounded-xl overflow-hidden aspect-video">
          {video.video_url && video.video_url.trim() !== '' ? (
            <iframe
              src={video.video_url}
              className="w-full h-full"
              allowFullScreen
              title={video.title}
            />
          ) : video.thumbnail_url ? (
            <img
              src={video.thumbnail_url.startsWith('http') ? video.thumbnail_url : `${API_URL.replace('/api', '')}${video.thumbnail_url}`}
              alt={video.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-20 h-20 text-white" />
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {video.title}
              </h1>
              {video.user_id && (
                <p className="text-gray-600">
                  Par {video.user_id.full_name}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{video.views || 0} vues</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{video.duration ? `${Math.floor(video.duration / 60)} min` : 'N/A'}</span>
            </div>
            {video.is_offline_available && (
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>Disponible hors-ligne</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <Heart className="w-5 h-5" />
              <span>{video.likes || 0}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
            >
              <Share2 className="w-5 h-5" />
              <span>Partager ({video.shares || 0})</span>
            </button>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {video.description || 'Aucune description disponible.'}
            </p>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VideoDetailPage;

