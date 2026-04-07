import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { clientLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await clientLogin(email, password);
      navigate('/cliente');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#064e3b,#065f46,#064e3b)'}}>
      <div style={{background:'white',borderRadius:16,boxShadow:'0 25px 50px rgba(0,0,0,0.25)',width:'100%',maxWidth:400,overflow:'hidden'}}>
        <div style={{background:'linear-gradient(90deg,#059669,#047857)',padding:32,textAlign:'center'}}>
          <h1 style={{fontSize:24,fontWeight:'bold',color:'white',margin:0}}>Leevin APP</h1>
          <p style={{color:'#a7f3d0',fontSize:14,marginTop:4}}>Portal do Cliente</p>
        </div>
        <form onSubmit={handleSubmit} style={{padding:32}}>
          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',padding:12,borderRadius:8,fontSize:14,marginBottom:16}}>{error}</div>}
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:14,fontWeight:500,marginBottom:4}}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
              style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,fontSize:14,boxSizing:'border-box'}} required />
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:14,fontWeight:500,marginBottom:4}}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha"
              style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,fontSize:14,boxSizing:'border-box'}} required />
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:12,background:loading?'#6ee7b7':'#059669',color:'white',border:'none',borderRadius:8,fontSize:16,fontWeight:600,cursor:loading?'not-allowed':'pointer'}}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <div style={{marginTop:16,textAlign:'center'}}>
            <Link to="/login" style={{color:'#059669',fontSize:13,textDecoration:'none'}}>Acesso Admin →</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
