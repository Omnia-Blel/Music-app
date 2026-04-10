import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const REVIEWS_QUERY = gql`
  query Reviews($page: Int, $limit: Int) {
    reviews(page: $page, limit: $limit) {
      nodes {
        id
        userId
        albumId
        rating
        comment
        album {
          id
          title
          artist {
            id
            name
          }
        }
        user {
          id
          username
        }
        createdAt
      }
      hasMore
      total
    }
  }
`;

const ALBUM_REVIEWS_QUERY = gql`
  query AlbumReviews($albumId: ID!) {
    albumReviews(albumId: $albumId) {
      id
      userId
      rating
      comment
      user {
        id
        username
      }
      createdAt
    }
  }
`;

const USER_REVIEWS_QUERY = gql`
  query UserReviews($userId: ID!) {
    userReviews(userId: $userId) {
      id
      albumId
      rating
      comment
      album {
        id
        title
        artist {
          id
          name
        }
      }
      createdAt
    }
  }
`;

const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      userId
      albumId
      rating
      comment
      createdAt
    }
  }
`;

const UPDATE_REVIEW_MUTATION = gql`
  mutation UpdateReview($id: ID!, $input: UpdateReviewInput!) {
    updateReview(id: $id, input: $input) {
      id
      rating
      comment
      updatedAt
    }
  }
`;

const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export default function Reviews({ token, userId }) {
  const [page, setPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [newReview, setNewReview] = useState({
    albumId: '',
    rating: 5,
    comment: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    rating: 5,
    comment: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading } = useQuery(REVIEWS_QUERY, {
    variables: { page, limit: 10 }
  });

  const { data: albumReviewsData } = useQuery(ALBUM_REVIEWS_QUERY, {
    variables: { albumId: selectedAlbumId },
    skip: !selectedAlbumId
  });

  const { data: userReviewsData } = useQuery(USER_REVIEWS_QUERY, {
    variables: { userId },
    skip: !userId
  });

  const [createReview] = useMutation(CREATE_REVIEW_MUTATION, {
    onCompleted: () => {
      setSuccess('Avis créé avec succès!');
      setNewReview({ albumId: '', rating: 5, comment: '' });
      setError('');
    },
    onError: (err) => setError(err.message),
    refetchQueries: [{ query: REVIEWS_QUERY, variables: { page, limit: 10 } }]
  });

  const [updateReview] = useMutation(UPDATE_REVIEW_MUTATION, {
    onCompleted: () => {
      setSuccess('Avis mis à jour avec succès!');
      setEditingId(null);
      setError('');
    },
    onError: (err) => setError(err.message),
    refetchQueries: [{ query: REVIEWS_QUERY, variables: { page, limit: 10 } }]
  });

  const [deleteReview] = useMutation(DELETE_REVIEW_MUTATION, {
    onCompleted: () => {
      setSuccess('Avis supprimé avec succès!');
      setError('');
    },
    onError: (err) => setError(err.message),
    refetchQueries: [{ query: REVIEWS_QUERY, variables: { page, limit: 10 } }]
  });

  const handleCreateReview = () => {
    if (!newReview.albumId || !newReview.rating) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }
    createReview({
      variables: {
        input: {
          albumId: newReview.albumId,
          rating: parseInt(newReview.rating),
          comment: newReview.comment
        }
      }
    });
  };

  const handleUpdateReview = (id) => {
    updateReview({
      variables: {
        id,
        input: {
          rating: parseInt(editData.rating),
          comment: editData.comment
        }
      }
    });
  };

  const reviews = data?.reviews?.nodes || [];

  return (
    <div className="component">
      <h2>⭐ Gestion des Avis</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Créer un avis */}
      <section className="section">
        <h3>Créer un nouvel avis</h3>
        <div className="form">
          <input
            type="text"
            placeholder="ID de l'album"
            value={newReview.albumId}
            onChange={(e) => setNewReview({...newReview, albumId: e.target.value})}
          />
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
          >
            <option value="1">⭐ 1 - Mauvais</option>
            <option value="2">⭐⭐ 2 - Médiocre</option>
            <option value="3">⭐⭐⭐ 3 - Moyen</option>
            <option value="4">⭐⭐⭐⭐ 4 - Bon</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
          </select>
          <textarea
            placeholder="Commentaire (optionnel)"
            value={newReview.comment}
            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
            rows="3"
          />
          <button onClick={handleCreateReview}>Créer l'avis</button>
        </div>
      </section>

      {/* Filtrer les avis */}
      <section className="section">
        <h3>Filtres</h3>
        <div className="filters">
          <button 
            className={reviewFilter === 'all' ? 'active' : ''}
            onClick={() => {
              setReviewFilter('all');
              setSelectedAlbumId('');
            }}
          >
            Tous les avis
          </button>
          <button 
            className={reviewFilter === 'mine' ? 'active' : ''}
            onClick={() => setReviewFilter('mine')}
          >
            Mes avis
          </button>
          <button 
            className={reviewFilter === 'album' ? 'active' : ''}
            onClick={() => setReviewFilter('album')}
          >
            Par album
          </button>
        </div>

        {reviewFilter === 'album' && (
          <div className="form">
            <input
              type="text"
              placeholder="Entrez l'ID de l'album"
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
            />
          </div>
        )}
      </section>

      {/* Liste des avis */}
      <section className="section">
        <h3>
          {reviewFilter === 'mine' ? 'Mes avis' : 
           reviewFilter === 'album' ? `Avis de l'album` :
           'Tous les avis'}
        </h3>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="reviews-list">
            {(reviewFilter === 'mine' && userReviewsData?.userReviews) ||
             (reviewFilter === 'album' && albumReviewsData?.albumReviews) ||
             (reviewFilter === 'all' && reviews)
            ? (
              (reviewFilter === 'mine' && userReviewsData?.userReviews) ||
              (reviewFilter === 'album' && albumReviewsData?.albumReviews) ||
              (reviewFilter === 'all' && reviews)
            ).map((review) => (
              <div key={review.id} className="review-item">
                {editingId === review.id ? (
                  <div className="edit-form">
                    <select
                      value={editData.rating}
                      onChange={(e) => setEditData({...editData, rating: e.target.value})}
                    >
                      <option value="1">⭐ 1</option>
                      <option value="2">⭐⭐ 2</option>
                      <option value="3">⭐⭐⭐ 3</option>
                      <option value="4">⭐⭐⭐⭐ 4</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5</option>
                    </select>
                    <textarea
                      value={editData.comment}
                      onChange={(e) => setEditData({...editData, comment: e.target.value})}
                      rows="2"
                    />
                    <div className="actions">
                      <button onClick={() => handleUpdateReview(review.id)}>Enregistrer</button>
                      <button onClick={() => setEditingId(null)}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="review-header">
                      <strong>{review.album?.title || 'Album'}</strong> - {review.album?.artist?.name || ''}
                    </div>
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating)}
                    </div>
                    <div className="review-comment">{review.comment}</div>
                    <div className="review-meta">
                      Par: {review.user?.username} • {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                    <div className="actions">
                      <button 
                        onClick={() => {
                          setEditingId(review.id);
                          setEditData({
                            rating: review.rating,
                            comment: review.comment
                          });
                        }}
                        className="edit-btn"
                      >
                        ✏️ Éditer
                      </button>
                      <button 
                        onClick={() => deleteReview({ variables: { id: review.id } })}
                        className="delete-btn"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
            : <p>Aucun avis trouvé</p>
            }
          </div>
        )}

        {reviewFilter === 'all' && data?.reviews?.hasMore && (
          <button onClick={() => setPage(page + 1)} className="load-more">
            Charger plus
          </button>
        )}
      </section>
    </div>
  );
}
