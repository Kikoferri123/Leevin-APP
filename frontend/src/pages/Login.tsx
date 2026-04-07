import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('admin@leevin.app');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1e293b,#1e3a5f,#1e293b)'}}>
      <div style={{background:'white',borderRadius:16,boxShadow:'0 25px 50px rgba(0,0,0,0.25)',width:'100%',maxWidth:400,overflow:'hidden'}}>
        <div style={{background:'linear-gradient(90deg,#2563eb,#1d4ed8)',padding:32,textAlign:'center'}}>
          <h1 style={{fontSize:24,fontWeight:'bold',color:'white',margin:0}}>Leevin APP</h1>
          <p style={{color:'#93c5fd',fontSize:14,marginTop:4}}>Property Management System</p>
        </div>
        <form onSubmit={handleSubmit} style={{padding:32}}>
          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',padding:12,borderRadius:8,fontSize:14,marginBottom:16}}>{error}</div>}
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:14,fontWeight:500,marginBottom:4}}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,fontSize:14,boxSizing:'border-box'}} required />
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:14,fontWeight:500,marginBottom:4}}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,fontSize:14,boxSizing:'border-box'}} required />
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:12,background:loading?'#93c5fd':'#2563eb',color:'white',border:'none',borderRadius:8,fontSize:16,fontWeight:600,cursor:loading?'not-allowed':'pointer'}}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
