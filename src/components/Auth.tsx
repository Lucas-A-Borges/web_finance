import React, { useState } from 'react';
import { logarUsuario, cadastrarUsuario } from '../services/authService';

export function Auth() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem('');

    try {
      if (modoCadastro) {
        await cadastrarUsuario(email, senha);
        setMensagem('Cadastro realizado! Verifique seu e-mail para confirmar (se aplicável) ou tente logar.');
      } else {
        await logarUsuario(email, senha);
        setMensagem('Conectado com sucesso!');
      }
    } catch (err: any) {
      setMensagem(`Erro: ${err.message}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{modoCadastro ? 'Criar Conta' : 'Entrar no Sistema'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          type="email" 
          placeholder="Seu e-mail" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="password" 
          placeholder="Sua senha" 
          value={senha} 
          onChange={(e) => setSenha(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <button type="submit" disabled={carregando} style={{ padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {carregando ? 'Processando...' : modoCadastro ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>
      
      {mensagem && <p style={{ marginTop: '12px', fontSize: '14px' }}>{mensagem}</p>}
      
      <button 
        onClick={() => setModoCadastro(!modoCadastro)} 
        style={{ marginTop: '16px', background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {modoCadastro ? 'Já tem uma conta? Entre por aqui' : 'Não tem conta? Cadastre-se'}
      </button>
    </div>
  );
}