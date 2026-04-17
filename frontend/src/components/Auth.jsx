import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email:    '',
    password: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [register, { loading: registerLoading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.register;
      onLogin(token, user);
      setSuccess('Inscription réussie !');
    },
    onError: (err) => setError(err.message),
  });

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.login;
      onLogin(token, user);
      setSuccess('Connexion réussie !');
    },
    onError: (err) => setError(err.message),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegister) {
      register({
        variables: {
          input: {
            username: formData.username,
            email:    formData.email,
            password: formData.password,
          },
        },
      });
    } else {
      login({
        variables: {
          input: {
            email:    formData.email,
            password: formData.password,
          },
        },
      });
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? '📝 Inscription' : '🔐 Connexion'}</h2>

      {error   && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="btn-primary"
            disabled={registerLoading || loginLoading}
          >
            {registerLoading || loginLoading ? '⏳ Chargement...' : 'Envoyer'}
          </button>
        </div>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
        {isRegister ? 'Déjà inscrit ?' : 'Pas inscrit ?'}
        <button
          onClick={switchMode}
          style={{
            background: 'none', border: 'none',
            color: '#667eea', cursor: 'pointer',
            marginLeft: '0.5rem', fontWeight: 'bold',
          }}
        >
          {isRegister ? 'Se connecter' : "S'inscrire"}
        </button>
      </p>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px', fontSize: '0.85rem' }}>
        <p><strong>Comptes de test disponibles :</strong></p>
        <p>Admin : admin@music.app / Admin1234!</p>
        <p>User : alice@example.com / User1234!</p>
      </div>
    </div>
  );
}