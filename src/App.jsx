import { useEffect, useState, useRef } from 'react';
import { Peer } from 'peerjs';

function App() {
  const [peerId, setPeerId] = useState('');
  const [remoteId, setRemoteId] = useState('');
  const peerInstance = useRef(null);
  const myAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    // Подключаемся к нашему будущему серверу на Render (пока пишем localhost для тестов)
    const peer = new Peer({
      host: 'https://twobackdis-cne-serr.onrender.com/', // При деплое заменишь на URL с Render.com
      port: 443,
      path: '/peerjs',
      secure: true,
    });

    peer.on('open', (id) => {
      setPeerId(id);
    });

    // Обработка ВХОДЯЩЕГО звонка
    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        // Отвечаем на звонок своим аудио-потоком
        call.answer(stream);
        
        // Слушаем аудио-поток собеседника
        call.on('stream', (remoteStream) => {
          remoteAudioRef.current.srcObject = remoteStream;
        });
      });
    });

    peerInstance.current = peer;
  }, []);

  // Функция для ИСХОДЯЩЕГО звонка
  const callUser = (id) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const call = peerInstance.current.call(id, stream);
      
      call.on('stream', (remoteStream) => {
        remoteAudioRef.current.srcObject = remoteStream;
      });
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mini Discord P2P</h1>
      
      <div style={{ background: '#2c2f33', color: 'white', padding: '10px', borderRadius: '8px' }}>
        <p>Твой ID: <strong>{peerId}</strong></p>
        <p>(Отправь его другу, чтобы он мог позвонить тебе)</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <input 
          type="text" 
          placeholder="Введи ID друга..." 
          value={remoteId} 
          onChange={(e) => setRemoteId(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={() => callUser(remoteId)} style={{ padding: '8px 16px' }}>
          Позвонить
        </button>
      </div>

      {/* Скрытые элементы аудио */}
      <audio ref={myAudioRef} autoPlay muted /> 
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}

export default App;
