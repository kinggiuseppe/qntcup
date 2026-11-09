/**
 * QNT CUP - TACTICAL LINKTREE ENGINE PRO
 * Map Veto (MD1 & MD3), Countdown, Story Generator, SFX & Canvas
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Sistema de Áudio Tático & BGM Engine (Web Audio API)
  let audioCtx = null;
  let soundEnabled = true;

  // Estado do BGM: ligado por padrão
  let bgmEnabled = true;
  let bgmTimer = null;
  let bgmGainNode = null;
  let bgmStep = 0;
  let bgmAudioStartedAt = 0;

  const BASS_FREQS = [73.42, 87.31, 98.00, 110.00];
  const ARP_FREQS = [293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 293.66, 220.00];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    return audioCtx;
  }

  function initAudio() {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function playTacticalClick(freq = 600, duration = 0.05, type = 'sine') {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (ctx.state !== 'running') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playBanSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || ctx.state !== 'running') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  function playPickSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || ctx.state !== 'running') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {}
  }

  function playSuccessTone() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // =========================================================================
  // SISTEMA DE MÚSICA AMBIENTE DE LOBBY VALORANT (BGM ENGINE)
  // =========================================================================

  function isBgmActuallyPlaying() {
    return bgmEnabled && bgmTimer !== null && audioCtx && audioCtx.state === 'running';
  }

  function playBgmStep() {
    if (!bgmEnabled) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    // 1. Kick tático suave a cada 4 passos
    if (bgmStep % 4 === 0) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(110, now);
      kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
      kickGain.gain.setValueAtTime(0.35, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      kickOsc.connect(kickGain);
      kickGain.connect(bgmGainNode);
      kickOsc.start(now);
      kickOsc.stop(now + 0.16);
    }

    // 2. Sub-bass espacial a cada 8 passos
    if (bgmStep % 8 === 0) {
      const bassIdx = Math.floor((bgmStep / 8) % BASS_FREQS.length);
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(BASS_FREQS[bassIdx], now);
      bassGain.gain.setValueAtTime(0.3, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      bassOsc.connect(bassGain);
      bassGain.connect(bgmGainNode);
      bassOsc.start(now);
      bassOsc.stop(now + 1.6);
    }

    // 3. Arpeggio de suspense tático
    const arpFreq = ARP_FREQS[bgmStep % ARP_FREQS.length];
    const arpOsc = ctx.createOscillator();
    const arpGain = ctx.createGain();
    arpOsc.type = 'sine';
    arpOsc.frequency.setValueAtTime(arpFreq, now);
    arpGain.gain.setValueAtTime(0.18, now);
    arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    arpOsc.connect(arpGain);
    arpGain.connect(bgmGainNode);
    arpOsc.start(now);
    arpOsc.stop(now + 0.26);

    bgmStep++;
  }

  function setupBgmNodes() {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    if (bgmTimer) return; // Já está rodando

    try {
      bgmGainNode = ctx.createGain();
      bgmGainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      bgmGainNode.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.5);
      bgmGainNode.connect(ctx.destination);

      bgmStep = 0;
      bgmAudioStartedAt = Date.now();
      playBgmStep();
      bgmTimer = setInterval(playBgmStep, 260);

      updateBgmUi(true);
    } catch (e) {}
  }

  function startBgmEngine() {
    if (!bgmEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (ctx.state === 'running' && bgmEnabled) setupBgmNodes();
      }).catch(() => {});
    } else if (ctx.state === 'running') {
      setupBgmNodes();
    }
  }

  function stopBgmEngine() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
    const ctx = getAudioContext();
    if (bgmGainNode && ctx) {
      try {
        bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, ctx.currentTime);
        bgmGainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        setTimeout(() => {
          try { bgmGainNode.disconnect(); } catch (e) {}
        }, 350);
      } catch (e) {}
    }
    updateBgmUi(false);
  }

  function updateBgmUi(isPlaying) {
    const btn = document.getElementById('bgmToggleBtn');
    const txt = document.getElementById('bgmText');
    if (isPlaying) {
      btn?.classList.add('playing');
      if (txt) txt.textContent = 'BGM: ON';
    } else {
      btn?.classList.remove('playing');
      if (txt) txt.textContent = 'BGM: OFF';
    }
  }

  // Controle Manual do Botão de BGM
  const bgmToggleBtn = document.getElementById('bgmToggleBtn');
  bgmToggleBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();

    // Se o áudio foi acabado de iniciar nos últimos 500ms pelo toque atual, não pausa!
    if (Date.now() - bgmAudioStartedAt < 500 && bgmTimer !== null) {
      return;
    }

    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {}
    }

    // Se o áudio não está tocando de verdade, INICIA (evita ter que desativar e reativar)
    if (!isBgmActuallyPlaying()) {
      bgmEnabled = true;
      startBgmEngine();
      showToast('🎵 Trilha de Lobby do VCT ativada!');
    } else {
      // Já está tocando com som: desativa
      bgmEnabled = false;
      stopBgmEngine();
      showToast('Música de fundo pausada');
    }
  });

  // Autoplay com Desbloqueio Universal em Primeiro Toque/Gesto na Tela
  async function unlockAudioOnFirstInteraction() {
    if (!bgmEnabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {}
    }

    if (ctx.state === 'running' && bgmEnabled && !bgmTimer) {
      startBgmEngine();
    }
  }

  // 1. Tentar tocar direto caso o navegador já tenha concedido autorização
  startBgmEngine();

  // 2. Escuta eventos universais de interação (clique, toque ou rolagem) para iniciar no primeiro gesto
  ['click', 'touchstart', 'touchend', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, unlockAudioOnFirstInteraction, { capture: true, passive: true });
  });

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundBtnText = soundToggleBtn?.querySelector('.hud-btn-text');

  soundToggleBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      initAudio();
      playTacticalClick(800, 0.08);
      if (soundBtnText) soundBtnText.textContent = 'SFX: ON';
      soundIcon?.setAttribute('data-lucide', 'volume-2');
    } else {
      if (soundBtnText) soundBtnText.textContent = 'SFX: OFF';
      soundIcon?.setAttribute('data-lucide', 'volume-x');
    }
    if (window.lucide) window.lucide.createIcons();
    showToast(soundEnabled ? 'Efeitos sonoros ativados!' : 'Efeitos sonoros desativados');
  });

  document.querySelectorAll('.sound-click').forEach((btn) => {
    btn.addEventListener('click', () => {
      playTacticalClick(750, 0.07, 'sine');
    });
  });

  // 3. Modais
  const modals = {
    banner: document.getElementById('modalBanner'),
    premiacao: document.getElementById('modalPremiacao'),
    regras: document.getElementById('modalRegras'),
    pix: document.getElementById('modalPix'),
    mapveto: document.getElementById('modalMapVeto'),
    bracket: document.getElementById('modalBracket'),
    story: document.getElementById('modalStory'),
    teamProfile: document.getElementById('modalTeamProfile'),
    matchDay: document.getElementById('modalMatchDay')
  };

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    playTacticalClick(900, 0.08, 'triangle');
    if (window.lucide) window.lucide.createIcons();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    playTacticalClick(350, 0.06, 'sine');
  }

  document.getElementById('openBannerBtn')?.addEventListener('click', () => openModal(modals.banner));
  document.getElementById('btnPremiacaoModal')?.addEventListener('click', () => openModal(modals.premiacao));
  document.getElementById('btnRegrasModal')?.addEventListener('click', () => openModal(modals.regras));
  document.getElementById('btnPixModal')?.addEventListener('click', () => openModal(modals.pix));
  document.getElementById('btnMapVetoModal')?.addEventListener('click', () => openModal(modals.mapveto));
  document.getElementById('btnBracketModal')?.addEventListener('click', () => openModal(modals.bracket));
  document.getElementById('btnStoryModal')?.addEventListener('click', () => {
    openModal(modals.story);
    const selectedTeam = storyTeamSelect?.value || 'snm';
    if (selectedTeam && selectedTeam !== 'custom') {
      loadTeamIntoStory(selectedTeam);
    } else {
      renderStoryCanvas();
    }
  });

  document.querySelectorAll('[data-close="modal"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const modal = e.target.closest('.cyber-modal');
      closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      Object.values(modals).forEach(closeModal);
    }
  });

  // 4. Countdown Tático até 14/11
  function initCountdown() {
    const cdDays = document.getElementById('cdDays');
    const cdHours = document.getElementById('cdHours');
    const cdMinutes = document.getElementById('cdMinutes');
    const cdSeconds = document.getElementById('cdSeconds');

    const targetDate = new Date('2026-11-14T13:00:00-03:00').getTime();

    function updateTimer() {
      const now = new Date().getTime();
      let diff = targetDate - now;

      if (diff <= 0) {
        if (cdDays) cdDays.textContent = '00';
        if (cdHours) cdHours.textContent = '00';
        if (cdMinutes) cdMinutes.textContent = '00';
        if (cdSeconds) cdSeconds.textContent = '00';
        const title = document.querySelector('.countdown-title');
        if (title) title.textContent = 'TORNEIO EM ANDAMENTO // AO VIVO';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
      if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
      if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
      if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }
  initCountdown();

  // 5. Copiar Chave Pix de 1-Clique
  const btnCopyPix = document.getElementById('btnCopyPix');
  const pixInput = document.getElementById('pixKeyInput');

  if (btnCopyPix && pixInput) {
    btnCopyPix.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pixInput.value);
        playSuccessTone();
        btnCopyPix.innerHTML = '<i data-lucide="check"></i> Copiado!';
        if (window.lucide) window.lucide.createIcons();
        showToast('Chave Pix copiada com sucesso!');
        setTimeout(() => {
          btnCopyPix.innerHTML = '<i data-lucide="copy"></i> Copiar';
          if (window.lucide) window.lucide.createIcons();
        }, 2500);
      } catch (err) {
        pixInput.select();
        document.execCommand('copy');
        showToast('Chave Pix copiada!');
      }
    });
  }

  // 6. Botão de Compartilhar
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      playTacticalClick(850, 0.08);
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'QNT CUP | Campeonato de Valorant',
            text: 'Garanta sua vaga na QNT CUP de Valorant! Apenas 4 equipes, premiação em VP e Pix!',
            url: window.location.href
          });
        } catch (e) {}
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          playSuccessTone();
          showToast('Link do torneio copiado para a área de transferência!');
        } catch (e) {
          showToast('Compartilhe: ' + window.location.href);
        }
      }
    });
  }

  // 7. Toast Notification Helper
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // =========================================================================
  // 8. SISTEMA DE MAP VETO (BANIMENTO DE MAPAS VALORANT)
  // Mapas oficiais: Lotus, Summit, Sunset, Bind, Abyss, Corrode, Haven
  // =========================================================================

  const OFFICIAL_MAPS = [
    { id: 'lotus', name: 'Lotus', gradient: 'linear-gradient(135deg, #7b2cbf, #9d4edd)' },
    { id: 'summit', name: 'Summit', gradient: 'linear-gradient(135deg, #1d3557, #457b9d)' },
    { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #b5179e, #7209b7)' },
    { id: 'bind', name: 'Bind', gradient: 'linear-gradient(135deg, #7f4f24, #936639)' },
    { id: 'abyss', name: 'Abyss', gradient: 'linear-gradient(135deg, #03045e, #0284c7)' },
    { id: 'corrode', name: 'Corrode', gradient: 'linear-gradient(135deg, #b45309, #78350f)' },
    { id: 'haven', name: 'Haven', gradient: 'linear-gradient(135deg, #9b2226, #ae2012)' }
  ];

  let currentVetoMode = 'MD1';
  let vetoStep = 0;
  let mapsState = {};
  let vetoHistory = [];

  const teamAInput = document.getElementById('teamANameInput');
  const teamBInput = document.getElementById('teamBNameInput');
  const modeMd1Btn = document.getElementById('modeMd1Btn');
  const modeMd3Btn = document.getElementById('modeMd3Btn');
  const vetoTurnBanner = document.getElementById('vetoTurnBanner');
  const vetoPhaseLabel = document.getElementById('vetoPhaseLabel');
  const vetoInstruction = document.getElementById('vetoInstruction');
  const currentTeamTurn = document.getElementById('currentTeamTurn');
  const vetoMapsContainer = document.getElementById('vetoMapsContainer');
  const vetoSummaryText = document.getElementById('vetoSummaryText');
  const btnCopyVetoResult = document.getElementById('btnCopyVetoResult');
  const btnResetVeto = document.getElementById('btnResetVeto');

  function getTeamName(teamKey) {
    if (teamKey === 'A') return teamAInput?.value.trim() || 'Só Na Manha';
    return teamBInput?.value.trim() || 'Katarrentos';
  }

  function resetVeto() {
    vetoStep = 0;
    vetoHistory = [];
    mapsState = {};
    OFFICIAL_MAPS.forEach((m) => {
      mapsState[m.id] = { status: 'available', by: null };
    });
    if (btnCopyVetoResult) btnCopyVetoResult.style.display = 'none';
    renderVetoMaps();
    updateVetoInstruction();
  }

  modeMd1Btn?.addEventListener('click', () => {
    currentVetoMode = 'MD1';
    modeMd1Btn.classList.add('active');
    modeMd3Btn.classList.remove('active');
    resetVeto();
  });

  modeMd3Btn?.addEventListener('click', () => {
    currentVetoMode = 'MD3';
    modeMd3Btn.classList.add('active');
    modeMd1Btn.classList.remove('active');
    resetVeto();
  });

  btnResetVeto?.addEventListener('click', resetVeto);

  [teamAInput, teamBInput].forEach((input) => {
    input?.addEventListener('input', () => {
      updateVetoInstruction();
      renderVetoSummary();
    });
  });

  function getStepInfo(step) {
    const teamA = getTeamName('A');
    const teamB = getTeamName('B');

    if (currentVetoMode === 'MD1') {
      const sequence = [
        { team: 'A', teamName: teamA, action: 'ban', label: `Vez de ${teamA} BANIR um mapa` },
        { team: 'B', teamName: teamB, action: 'ban', label: `Vez de ${teamB} BANIR um mapa` },
        { team: 'A', teamName: teamA, action: 'ban', label: `Vez de ${teamA} BANIR um mapa` },
        { team: 'B', teamName: teamB, action: 'ban', label: `Vez de ${teamB} BANIR um mapa` },
        { team: 'A', teamName: teamA, action: 'ban', label: `Vez de ${teamA} BANIR um mapa` },
        { team: 'B', teamName: teamB, action: 'ban', label: `Vez de ${teamB} BANIR um mapa` }
      ];
      return sequence[step] || null;
    } else {
      // MD3: 2 bans iniciais (1 cada time) -> 2 picks (o outro time escolhe o lado) -> 2 bans finais -> 1 decider
      const sequence = [
        { team: 'A', teamName: teamA, action: 'ban', label: `Vez de ${teamA} BANIR um mapa (1º Ban)` },
        { team: 'B', teamName: teamB, action: 'ban', label: `Vez de ${teamB} BANIR um mapa (2º Ban)` },
        { team: 'A', teamName: teamA, action: 'pick', mapNum: 1, sideNote: `${teamB} escolhe o lado`, label: `Vez de ${teamA} ESCOLHER seu mapa (Mapa 1)` },
        { team: 'B', teamName: teamB, action: 'pick', mapNum: 2, sideNote: `${teamA} escolhe o lado`, label: `Vez de ${teamB} ESCOLHER seu mapa (Mapa 2)` },
        { team: 'A', teamName: teamA, action: 'ban', label: `Vez de ${teamA} BANIR um mapa` },
        { team: 'B', teamName: teamB, action: 'ban', label: `Vez de ${teamB} BANIR um mapa` }
      ];
      return sequence[step] || null;
    }
  }

  function updateVetoInstruction() {
    const stepInfo = getStepInfo(vetoStep);

    if (stepInfo) {
      if (vetoPhaseLabel) {
        vetoPhaseLabel.textContent = stepInfo.action === 'pick' ? 'FASE DE ESCOLHA (PICK)' : 'FASE DE BANIMENTO';
      }
      if (vetoInstruction) {
        const actionWord = stepInfo.action === 'pick' ? 'ESCOLHER' : 'BANIR';
        const colorClass = stepInfo.action === 'pick' ? 'text-gold' : 'text-neon-red';
        const sideInfo = stepInfo.sideNote ? `<span style="display:block; font-size:0.72rem; color:var(--neon-cyan); margin-top:3px;"><i data-lucide="shield"></i> (${stepInfo.sideNote})</span>` : '';
        vetoInstruction.innerHTML = `Vez de <strong class="${colorClass}">${stepInfo.teamName}</strong> ${actionWord} um mapa${sideInfo}`;
        if (window.lucide) window.lucide.createIcons();
      }
    } else {
      if (vetoPhaseLabel) vetoPhaseLabel.textContent = 'MAP VETO CONCLUÍDO';
      if (vetoInstruction) {
        vetoInstruction.innerHTML = `<strong class="text-tactical-green">Todos os mapas foram definidos com sucesso!</strong>`;
      }
      if (btnCopyVetoResult) btnCopyVetoResult.style.display = 'flex';
    }

    renderVetoSummary();
  }

  function onMapClick(mapId) {
    const map = mapsState[mapId];
    if (!map || map.status !== 'available') return;

    const stepInfo = getStepInfo(vetoStep);
    if (!stepInfo) return;

    const teamA = getTeamName('A');
    const teamB = getTeamName('B');

    if (stepInfo.action === 'ban') {
      map.status = 'banned';
      map.by = stepInfo.teamName;
      playBanSound();
      vetoHistory.push(`🚫 ${stepInfo.teamName} BANIU ${map.name ? map.name.toUpperCase() : mapId.toUpperCase()}`);
    } else if (stepInfo.action === 'pick') {
      map.status = 'picked';
      map.by = stepInfo.teamName;
      map.sideBy = stepInfo.team === 'A' ? teamB : teamA;
      playPickSound();
      const sideText = stepInfo.sideNote ? ` (${stepInfo.sideNote})` : '';
      vetoHistory.push(`⭐ Mapa ${stepInfo.mapNum || ''}: ${map.name ? map.name.toUpperCase() : mapId.toUpperCase()} (Pick de ${stepInfo.teamName}${sideText})`);
    }

    vetoStep++;

    const availableMaps = OFFICIAL_MAPS.filter((m) => mapsState[m.id].status === 'available');
    if (availableMaps.length === 1) {
      const deciderMap = availableMaps[0];
      mapsState[deciderMap.id].status = 'decider';
      mapsState[deciderMap.id].by = 'DESEMPATE / DECIDER';
      playSuccessTone();
      vetoHistory.push(`🎯 MAPA DECISIVO (DECIDER): ${deciderMap.name.toUpperCase()}`);
      vetoStep = 999;
    }

    renderVetoMaps();
    updateVetoInstruction();
  }

  function renderVetoMaps() {
    if (!vetoMapsContainer) return;
    vetoMapsContainer.innerHTML = '';

    OFFICIAL_MAPS.forEach((map) => {
      const state = mapsState[map.id] || { status: 'available', by: null };
      const card = document.createElement('div');
      card.className = `map-card ${state.status} sound-click`;

      let statusText = 'DISPONÍVEL';
      if (state.status === 'banned') statusText = `BANIDO (${state.by})`;
      else if (state.status === 'picked') statusText = `PICK (${state.by})`;
      else if (state.status === 'decider') statusText = 'MAPA DO CONFRONTO';

      card.innerHTML = `
        <div class="map-card-art" style="background: ${map.gradient}">
          <span class="map-card-name">${map.name}</span>
        </div>
        <div class="map-card-footer">
          <span class="map-status-pill">${statusText}</span>
        </div>
      `;

      card.addEventListener('click', () => onMapClick(map.id));
      vetoMapsContainer.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function renderVetoSummary() {
    if (!vetoSummaryText) return;
    const teamA = getTeamName('A');
    const teamB = getTeamName('B');

    if (vetoHistory.length === 0) {
      vetoSummaryText.textContent = `Aguardando início do banimento entre ${teamA} e ${teamB} (${currentVetoMode}).`;
      return;
    }

    let summary = `⚔️ ${teamA} vs ${teamB} [${currentVetoMode}]\n\n`;

    if (currentVetoMode === 'MD1') {
      const decider = OFFICIAL_MAPS.find((m) => mapsState[m.id].status === 'decider');
      if (decider) {
        summary += `🔥 MAPA DA PARTIDA: ${decider.name.toUpperCase()}\n\n`;
      }
    } else {
      const picks = OFFICIAL_MAPS.filter((m) => mapsState[m.id].status === 'picked');
      const decider = OFFICIAL_MAPS.find((m) => mapsState[m.id].status === 'decider');

      picks.forEach((p, idx) => {
        const pickingTeam = mapsState[p.id].by;
        const sideTeam = mapsState[p.id].sideBy || (pickingTeam === teamA ? teamB : teamA);
        summary += `• Mapa ${idx + 1}: ${p.name.toUpperCase()} (Pick de ${pickingTeam} | ${sideTeam} escolhe o lado)\n`;
      });
      if (decider) {
        summary += `• Mapa 3 (Decider): ${decider.name.toUpperCase()} (Lado por faca/sorteio)\n\n`;
      }
    }

    summary += `Histórico de Ações:\n` + vetoHistory.join('\n');
    vetoSummaryText.textContent = summary;
  }

  btnCopyVetoResult?.addEventListener('click', async () => {
    const textToCopy = `🏆 *QNT CUP - RESULTADO DO MAP VETO*\n` + vetoSummaryText.textContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      playSuccessTone();
      showToast('Resumo do Veto copiado para o WhatsApp!');
    } catch (e) {
      showToast('Texto pronto para copiar!');
    }
  });

  resetVeto();

  // =========================================================================
  // 9. GERADOR DE STORY OFICIAL PARA O INSTAGRAM (CANVAS 1080x1920)
  // =========================================================================

  const storyCanvas = document.getElementById('storyCanvas');
  const storyTeamSelect = document.getElementById('storyTeamSelect');
  const storyTeamName = document.getElementById('storyTeamName');
  const storyPlayer1 = document.getElementById('storyPlayer1');
  const storyPlayer2 = document.getElementById('storyPlayer2');
  const storyPlayer3 = document.getElementById('storyPlayer3');
  const storyPlayer4 = document.getElementById('storyPlayer4');
  const storyPlayer5 = document.getElementById('storyPlayer5');
  const storyPlayerSub = document.getElementById('storyPlayerSub');
  const btnDownloadStory = document.getElementById('btnDownloadStory');

  function loadTeamIntoStory(teamId) {
    const data = TEAMS_DATA[teamId];
    if (!data) return;

    if (storyTeamName) storyTeamName.value = data.name.toUpperCase();
    if (data.players && data.players.length >= 5) {
      if (storyPlayer1) storyPlayer1.value = data.players[0].nick + (data.players[0].isCaptain ? ' (Capitão)' : '');
      if (storyPlayer2) storyPlayer2.value = data.players[1].nick + (data.players[1].isCaptain ? ' (Capitão)' : '');
      if (storyPlayer3) storyPlayer3.value = data.players[2].nick + (data.players[2].isCaptain ? ' (Capitão)' : '');
      if (storyPlayer4) storyPlayer4.value = data.players[3].nick + (data.players[3].isCaptain ? ' (Capitão)' : '');
      if (storyPlayer5) storyPlayer5.value = data.players[4].nick + (data.players[4].isCaptain ? ' (Capitão)' : '');
    }
    if (storyPlayerSub) storyPlayerSub.value = '';
    renderStoryCanvas();
  }

  storyTeamSelect?.addEventListener('change', (e) => {
    const teamId = e.target.value;
    if (teamId && teamId !== 'custom') {
      loadTeamIntoStory(teamId);
    }
    playTacticalClick(750, 0.06);
  });

  // Logo da QNT Cup embutida como Data URI para evitar restrições de CORS / Tainted Canvas local
  const QNT_LOGO_DATA_URI = "data:image/jpeg;base64,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";
  const logoImage = new Image();
  logoImage.src = QNT_LOGO_DATA_URI;
  logoImage.onload = () => {
    renderStoryCanvas();
  };

  function renderStoryCanvas() {
    if (!storyCanvas) return;
    const ctx = storyCanvas.getContext('2d');
    const w = 1080;
    const h = 1920;

    // 1. Fundo escuro com vinheta e degradê vermelho tático
    const bgGrad = ctx.createRadialGradient(w / 2, 400, 100, w / 2, h / 2, 1000);
    bgGrad.addColorStop(0, '#1c2633');
    bgGrad.addColorStop(0.5, '#0e141c');
    bgGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Linhas cibernéticas e scanlines de fundo
    ctx.strokeStyle = 'rgba(255, 70, 85, 0.12)';
    ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Moldura cibernética externa
    ctx.strokeStyle = 'rgba(255, 70, 85, 0.4)';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // 2. Topo: Logo Oficial QNT CUP
    if (logoImage.complete && logoImage.naturalWidth > 0) {
      ctx.save();
      const logoSize = 220;
      const logoX = (w - logoSize) / 2;
      const logoY = 110;
      ctx.shadowColor = '#ff4655';
      ctx.shadowBlur = 40;
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    }

    // Título Topo
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4655';
    ctx.font = 'bold 36px "Chakra Petch", sans-serif';
    ctx.fillText('CAMPEONATO DE VALORANT // @QNTCUP', w / 2, 380);

    // 3. Faixa de Status "EQUIPE CONFIRMADA"
    ctx.fillStyle = 'rgba(255, 70, 85, 0.18)';
    ctx.fillRect(100, 420, w - 200, 70);
    ctx.strokeStyle = '#ff4655';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 420, w - 200, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Teko", sans-serif';
    ctx.fillText('⚡ EQUIPE CONFIRMADA NA DISPUTA ⚡', w / 2, 468);

    // 4. Nome da Equipe
    const teamName = storyTeamName?.value.trim() || 'NOME DO TIME';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 85px "Teko", sans-serif';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 25;
    ctx.fillText(teamName.toUpperCase(), w / 2, 600);
    ctx.shadowBlur = 0;

    // Subtítulo
    ctx.fillStyle = '#8b97a2';
    ctx.font = '30px "Chakra Petch", sans-serif';
    ctx.fillText('LINE-UP OFICIAL // 5 JOGADORES', w / 2, 660);

    // 5. Box dos Jogadores
    const players = [
      storyPlayer1?.value || 'Jogador 1 (Capitão)',
      storyPlayer2?.value || 'Jogador 2',
      storyPlayer3?.value || 'Jogador 3',
      storyPlayer4?.value || 'Jogador 4',
      storyPlayer5?.value || 'Jogador 5'
    ];
    const subPlayer = storyPlayerSub?.value.trim();
    if (subPlayer) players.push(`Reserva: ${subPlayer}`);

    let startY = 740;
    players.forEach((player, idx) => {
      const boxY = startY + idx * 105;

      ctx.fillStyle = 'rgba(18, 25, 33, 0.9)';
      ctx.fillRect(160, boxY, w - 320, 85);
      ctx.strokeStyle = idx === 0 ? '#ffd700' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(160, boxY, w - 320, 85);

      ctx.fillStyle = idx === 0 ? '#ffd700' : '#ff4655';
      ctx.fillRect(160, boxY, 12, 85);

      ctx.textAlign = 'left';
      ctx.fillStyle = idx === 0 ? '#ffd700' : '#8b97a2';
      ctx.font = 'bold 32px "Chakra Petch", sans-serif';
      ctx.fillText(`#0${idx + 1}`, 195, boxY + 54);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px "Teko", sans-serif';
      ctx.fillText(player.toUpperCase(), 290, boxY + 55);
    });

    // 6. Rodapé: Informações da Copa e Patrocinadores
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ece8e1';
    ctx.font = 'bold 36px "Chakra Petch", sans-serif';
    ctx.fillText('📅 14 E 15 DE NOVEMBRO • PREMIAÇÃO EM VP + PIX', w / 2, 1600);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 26px "Chakra Petch", sans-serif';
    ctx.fillText('PATROCÍNIO MASTER: NamoGrafic • Monteiro\'s Pet', w / 2, 1670);
    ctx.fillStyle = '#8b97a2';
    ctx.font = '24px "Chakra Petch", sans-serif';
    ctx.fillText('PATROCINADORES: D. Alves 3D • Trajano.Sports', w / 2, 1715);

    ctx.fillStyle = '#ff4655';
    ctx.font = 'bold 34px "Teko", sans-serif';
    ctx.fillText('SIGA NO INSTAGRAM: @QNTCUP', w / 2, 1800);
  }

  [storyTeamName, storyPlayer1, storyPlayer2, storyPlayer3, storyPlayer4, storyPlayer5, storyPlayerSub].forEach((inp) => {
    inp?.addEventListener('input', renderStoryCanvas);
  });

  // DOWNLOAD UNIVERSAL COM BLOB E DATA URL RESILIENTE
  btnDownloadStory?.addEventListener('click', () => {
    if (!storyCanvas) return;
    playSuccessTone();

    const safeName = (storyTeamName?.value || 'TIME').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `QNT_CUP_STORY_${safeName}.png`;

    try {
      if (storyCanvas.toBlob) {
        storyCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.download = filename;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 2000);
            showToast('Card do Story baixado com sucesso!');
          } else {
            downloadViaDataUrl(filename);
          }
        }, 'image/png');
      } else {
        downloadViaDataUrl(filename);
      }
    } catch (e) {
      downloadViaDataUrl(filename);
    }
  });

  function downloadViaDataUrl(filename) {
    try {
      const dataUrl = storyCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.style.display = 'none';
      a.download = filename;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 1000);
      showToast('Card do Story baixado com sucesso!');
    } catch (err) {
      // Fallback final: abrir a imagem em nova janela
      try {
        const dataUrl = storyCanvas.toDataURL('image/png');
        const win = window.open();
        if (win) {
          win.document.write('<img src="' + dataUrl + '" style="max-width:100%;height:auto;"><p style="color:#333;font-family:sans-serif;">Toque e segure para salvar a imagem!</p>');
        }
        showToast('Toque e segure na imagem para salvar!');
      } catch (err2) {
        showToast('Erro ao exportar canvas.');
      }
    }
  }

  // // 10. EFEITO 3D TILT / HOLOGRAPHIC SHEEN NOS CARDS E LOGO
  // =========================================================================

  const tiltCards = document.querySelectorAll('.master-card, .profile-logo, .highlight-mapveto');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // =========================================================================
  // 11. AMBIENT PARTICLES (CANVAS DE FAÍSCAS VALORANT)
  // =========================================================================

  const canvas = document.getElementById('ambientCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        speedY: -(Math.random() * 0.7 + 0.3),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.4 ? 'rgba(255, 70, 85,' : 'rgba(255, 215, 0,'
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }


  // =========================================================================
  // 12. SOM DE "MATCH FOUND" AO CLICAR EM INSCREVER
  // =========================================================================

  function playMatchFoundSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.15);
      osc1.frequency.setValueAtTime(540, now + 0.18);

      osc2.frequency.setValueAtTime(280, now);
      osc2.frequency.setValueAtTime(640, now + 0.18);
      osc2.frequency.setValueAtTime(1080, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    } catch (e) {}
  }

  const btnInscricao = document.getElementById('btnInscricao');
  if (btnInscricao) {
    btnInscricao.addEventListener('click', () => {
      playMatchFoundSound();
      showToast('⚔️ PARTIDA ENCONTRADA! Abrindo WhatsApp...');
    });
  }

  // =========================================================================
  // 13. MODO SECRETO "SPIKE ARMED" (EASTER EGG GAMER)
  // =========================================================================

  let spikeArmed = false;
  let spikeInterval = null;

  function playSpikeBeep() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  function playSpikeDefusedSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  function toggleSpikeMode() {
    spikeArmed = !spikeArmed;
    const statusText = document.querySelector('.hud-status-text');

    if (spikeArmed) {
      document.body.classList.add('spike-armed-mode');
      if (statusText) statusText.innerHTML = 'ALERTA: <strong class="text-neon-red">SPIKE PLANTED // RUSH A</strong>';
      playSpikeBeep();
      showToast('⚠️ SPIKE PLANTADA! Modo de Alerta Máximo ativado!');
      spikeInterval = setInterval(playSpikeBeep, 900);
    } else {
      document.body.classList.remove('spike-armed-mode');
      if (statusText) statusText.innerHTML = 'STATUS: <strong class="text-neon-red">INSCRIÇÕES ABERTAS</strong>';
      clearInterval(spikeInterval);
      playSpikeDefusedSound();
      showToast('✅ SPIKE DEFUSED! A área está segura.');
    }
  }

  const logoImg = document.getElementById('logoImg');
  logoImg?.addEventListener('dblclick', toggleSpikeMode);

  let lastTap = 0;
  logoImg?.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 350 && tapLength > 0) {
      toggleSpikeMode();
      e.preventDefault();
    }
    lastTap = currentTime;
  });

  // =========================================================================
  // 14. FAQ TÁTICO ACCORDION (DÚVIDAS FREQUENTES)
  // =========================================================================

  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-item');
      const isActive = parent.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('active');
      });

      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });

  // =========================================================================
  // 15. CURSOR TÁTICO GAMER (DESKTOP) & TAP RIPPLE (MOBILE)
  // =========================================================================

  const crosshair = document.getElementById('tacticalCrosshair');
  if (crosshair && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      crosshair.style.left = e.clientX + 'px';
      crosshair.style.top = e.clientY + 'px';
    });

    const interactiveSelectors = 'button, a, input, .sound-click, .map-card, .faq-question';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => crosshair.classList.add('hovering'));
      el.addEventListener('mouseleave', () => crosshair.classList.remove('hovering'));
    });
  }

  // =========================================================================
  // 14. DADOS E MODAL DE LINEUP / PERFIL DA EQUIPE
  // =========================================================================
  const TEAMS_DATA = {
    snm: {
      name: 'Só Na Manha',
      tag: 'SNM',
      seed: 'SEED #1 // CONFIRMADO',
      logo: 'assets/team_snm.png',
      theme: 'theme-gold',
      motto: '"Na calma, no round e na mira."',
      players: [
        { nick: 'GXM3S', isCaptain: true },
        { nick: 'NEVOEIRO', isCaptain: false },
        { nick: 'Rato molhado', isCaptain: false },
        { nick: 'H0GGYBR11', isCaptain: false },
        { nick: 'unknown', isCaptain: false }
      ],
      sub: 'Reserva a confirmar pelo capitão'
    },
    katarrentos: {
      name: 'Katarrentos',
      tag: 'KAT',
      seed: 'SEED #2 // CONFIRMADO',
      logo: 'assets/team_katarrentos.png',
      theme: 'theme-purple',
      motto: '"O veneno tá armado. Sem piedade no clutch."',
      players: [
        { nick: 'KTDFATO', isCaptain: true },
        { nick: 'drn', isCaptain: false },
        { nick: 'lohan1213', isCaptain: false },
        { nick: 'ymurilloxit', isCaptain: false },
        { nick: 'LOUD Tkzin', isCaptain: false }
      ],
      sub: 'Reserva a confirmar pelo capitão'
    },
    ragnarok: {
      name: 'Ragnarök',
      tag: 'RAG',
      seed: 'SEED #3 // CONFIRMADO',
      logo: 'assets/team_ragnarok.png',
      theme: 'theme-cyan',
      motto: '"O crepúsculo dos deuses. A queda dos adversários."',
      players: [
        { nick: 'RayoVac', isCaptain: true },
        { nick: 'Flash', isCaptain: false },
        { nick: 'Nixt', isCaptain: false },
        { nick: 'Reyca', isCaptain: false },
        { nick: 'Vai da não', isCaptain: false }
      ],
      sub: 'Reserva a confirmar pelo capitão'
    },
    sgl: {
      name: 'Se Ganhar é Lucro',
      tag: 'SGL',
      seed: 'SEED #4 // CONFIRMADO',
      logo: 'assets/team_sgl.png',
      theme: 'theme-red',
      motto: '"Sem pressão, na bala e o que vier é lucro."',
      players: [
        { nick: 'yse', isCaptain: true },
        { nick: 'NuRmAgUmEdOv', isCaptain: false },
        { nick: 'Lckz', isCaptain: false },
        { nick: 'Arise', isCaptain: false },
        { nick: 'crok', isCaptain: false }
      ],
      sub: 'Reserva a confirmar pelo capitão'
    }
  };

  let activeProfileTeamId = 'snm';

  function openTeamProfile(teamId) {
    const data = TEAMS_DATA[teamId];
    if (!data) return;

    activeProfileTeamId = teamId;

    const modalTitle = document.getElementById('teamModalTitle');
    const heroCard = document.getElementById('teamHeroCard');
    const heroLogo = document.getElementById('teamHeroLogo');
    const heroSeed = document.getElementById('teamHeroSeed');
    const heroName = document.getElementById('teamHeroName');
    const heroMotto = document.getElementById('teamHeroMotto');
    const rosterList = document.getElementById('teamRosterList');
    const subName = document.getElementById('teamSubName');

    if (modalTitle) modalTitle.textContent = `PERFIL DA EQUIPE // ${data.tag}`;
    if (heroCard) heroCard.className = `team-profile-hero ${data.theme}`;
    if (heroLogo) {
      heroLogo.src = data.logo;
      heroLogo.alt = data.name;
    }
    if (heroSeed) heroSeed.textContent = data.seed;
    if (heroName) heroName.textContent = data.name.toUpperCase();
    if (heroMotto) heroMotto.textContent = data.motto;
    if (subName) subName.textContent = data.sub;

    if (rosterList) {
      rosterList.innerHTML = '';
      data.players.forEach((p, idx) => {
        const item = document.createElement('div');
        item.className = 'player-roster-card';
        item.innerHTML = `
          <div class="player-card-left">
            <span class="player-num">#0${idx + 1}</span>
            <span class="player-nick">${p.nick}</span>
          </div>
          <div class="player-card-right">
            ${p.isCaptain ? '<span class="player-role-badge captain"><i data-lucide="crown"></i> CAPITÃO</span>' : ''}
          </div>
        `;
        rosterList.appendChild(item);
      });
    }

    if (window.lucide) window.lucide.createIcons();
    openModal(modals.teamProfile);
  }

  // Click nos slots confirmados para abrir o perfil
  document.querySelectorAll('.slot-interactive').forEach((slot) => {
    slot.addEventListener('click', () => {
      const teamId = slot.getAttribute('data-team-id');
      if (teamId) {
        playTacticalClick(720, 0.08);
        openTeamProfile(teamId);
      }
    });
  });

  // Botão "Testar Confronto no Map Veto" dentro do modal de perfil
  document.getElementById('btnChallengeInVeto')?.addEventListener('click', () => {
    closeModal(modals.teamProfile);
    setTimeout(() => {
      openModal(modals.mapveto);
      const teamAInput = document.getElementById('teamANameInput');
      if (teamAInput) {
        teamAInput.value = TEAMS_DATA[activeProfileTeamId]?.name || 'Só Na Manha';
      }
      playTacticalClick(800, 0.08);
    }, 200);
  });

  // =========================================================================
  // 15. GERADOR MATCH DAY // STORIES 9:16
  // =========================================================================
  const matchDayCanvas = document.getElementById('matchDayCanvas');
  const btnMatchDayModal = document.getElementById('btnMatchDayModal');
  const btnDownloadMatchDay = document.getElementById('btnDownloadMatchDay');
  const matchTeamASelect = document.getElementById('matchTeamASelect');
  const matchTeamBSelect = document.getElementById('matchTeamBSelect');
  const matchPhaseSelect = document.getElementById('matchPhaseSelect');
  const matchDateInput = document.getElementById('matchDateInput');

  btnMatchDayModal?.addEventListener('click', () => {
    openModal(modals.matchDay);
    renderMatchDayCanvas();
  });

  // Imagens cacheadas para os times no Canvas
  const teamLogosCache = {
    snm: new Image(),
    katarrentos: new Image(),
    ragnarok: new Image(),
    sgl: new Image()
  };
  teamLogosCache.snm.src = 'assets/team_snm.png';
  teamLogosCache.katarrentos.src = 'assets/team_katarrentos.png';
  teamLogosCache.ragnarok.src = 'assets/team_ragnarok.png';
  teamLogosCache.sgl.src = 'assets/team_sgl.png';

  function renderMatchDayCanvas() {
    if (!matchDayCanvas) return;
    const ctx = matchDayCanvas.getContext('2d');
    const w = 1080;
    const h = 1920;

    // 1. Fundo Gradiente Tático Gamer
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(0.3, '#101721');
    bgGrad.addColorStop(0.7, '#151324');
    bgGrad.addColorStop(1, '#06070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Efeitos de Luzes Neon nas Laterais
    const glowLeft = ctx.createRadialGradient(180, 850, 50, 180, 850, 450);
    glowLeft.addColorStop(0, 'rgba(255, 215, 0, 0.18)');
    glowLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowLeft;
    ctx.fillRect(0, 400, w, 900);

    const glowRight = ctx.createRadialGradient(900, 850, 50, 900, 850, 450);
    glowRight.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
    glowRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowRight;
    ctx.fillRect(0, 400, w, 900);

    // Scanlines sutis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Moldura Cyberpunk Externa com cortes de canto
    ctx.strokeStyle = 'rgba(255, 70, 85, 0.35)';
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // 2. Topo: Logo Oficial QNT CUP
    if (logoImage.complete && logoImage.naturalWidth > 0) {
      ctx.save();
      const logoSize = 200;
      const logoX = (w - logoSize) / 2;
      const logoY = 90;
      ctx.shadowColor = '#ff4655';
      ctx.shadowBlur = 35;
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    }

    // Título Superior
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4655';
    ctx.font = 'bold 34px "Chakra Petch", sans-serif';
    ctx.fillText('CAMPEONATO DE VALORANT // 1ª EDIÇÃO', w / 2, 340);

    // 3. Faixa de MATCH DAY
    ctx.fillStyle = '#ff4655';
    ctx.fillRect((w - 480) / 2, 380, 480, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Teko", sans-serif';
    ctx.fillText('⚔️ MATCH DAY // CONFRONTO ⚔️', w / 2, 428);

    // Fase do jogo
    const phaseText = matchPhaseSelect?.value || 'SEMIFINAL #01 // MD1';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px "Chakra Petch", sans-serif';
    ctx.fillText(phaseText, w / 2, 510);

    // Data e Horário
    const dateText = matchDateInput?.value || '14 DE NOVEMBRO • 13:00 BRT';
    ctx.fillStyle = '#ece8e1';
    ctx.font = '28px "Chakra Petch", sans-serif';
    ctx.fillText(`🕒 ${dateText}`, w / 2, 560);

    // 4. ARENA DO CONFRONTO: TIME A (Esquerda) vs TIME B (Direita)
    const teamAVal = matchTeamASelect?.value || 'snm';
    const teamBVal = matchTeamBSelect?.value || 'katarrentos';

    function getMatchTeamName(val) {
      if (val === 'snm') return 'SÓ NA MANHA';
      if (val === 'katarrentos') return 'KATARRENTOS';
      if (val === 'ragnarok') return 'RAGNARÖK';
      if (val === 'sgl') return 'SE GANHAR É LUCRO';
      return 'EQUIPE VAGA';
    }
    function getMatchTeamColor(val) {
      if (val === 'snm') return '#ffd700';
      if (val === 'katarrentos') return '#c084fc';
      if (val === 'ragnarok') return '#00f0ff';
      if (val === 'sgl') return '#ff4655';
      return '#ff4655';
    }
    const teamAName = getMatchTeamName(teamAVal);
    const teamBName = getMatchTeamName(teamBVal);
    const colorA = getMatchTeamColor(teamAVal);
    const colorB = getMatchTeamColor(teamBVal);

    // Box Time A
    const boxAY = 700;
    const boxAX = 140;
    const boxSize = 280;

    // Emblema Time A
    ctx.save();
    ctx.fillStyle = 'rgba(20, 28, 38, 0.85)';
    ctx.fillRect(boxAX, boxAY, boxSize, boxSize);
    ctx.strokeStyle = colorA;
    ctx.lineWidth = 4;
    ctx.strokeRect(boxAX, boxAY, boxSize, boxSize);

    const imgA = teamLogosCache[teamAVal];
    if (imgA && imgA.complete && imgA.naturalWidth > 0) {
      ctx.shadowColor = colorA;
      ctx.shadowBlur = 20;
      ctx.drawImage(imgA, boxAX + 25, boxAY + 25, boxSize - 50, boxSize - 50);
    } else {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 60px "Teko", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(teamAVal.toUpperCase(), boxAX + boxSize / 2, boxAY + boxSize / 2 + 20);
    }
    ctx.restore();

    // Nome Time A
    ctx.textAlign = 'center';
    ctx.fillStyle = colorA;
    ctx.font = 'bold 50px "Teko", sans-serif';
    ctx.fillText(teamAName, boxAX + boxSize / 2, boxAY + boxSize + 60);

    // Central VS Badge
    const vsY = boxAY + boxSize / 2;
    ctx.save();
    ctx.fillStyle = '#05070a';
    ctx.beginPath();
    ctx.arc(w / 2, vsY, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff4655';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 65px "Teko", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff4655';
    ctx.shadowBlur = 20;
    ctx.fillText('VS', w / 2, vsY + 22);
    ctx.restore();

    // Box Time B
    const boxBX = w - 140 - boxSize;
    ctx.save();
    ctx.fillStyle = 'rgba(20, 28, 38, 0.85)';
    ctx.fillRect(boxBX, boxAY, boxSize, boxSize);
    ctx.strokeStyle = colorB;
    ctx.lineWidth = 4;
    ctx.strokeRect(boxBX, boxAY, boxSize, boxSize);

    const imgB = teamLogosCache[teamBVal];
    if (imgB && imgB.complete && imgB.naturalWidth > 0) {
      ctx.shadowColor = colorB;
      ctx.shadowBlur = 20;
      ctx.drawImage(imgB, boxBX + 25, boxAY + 25, boxSize - 50, boxSize - 50);
    } else {
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 60px "Teko", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(teamBVal.toUpperCase(), boxBX + boxSize / 2, boxAY + boxSize / 2 + 20);
    }
    ctx.restore();

    // Nome Time B
    ctx.textAlign = 'center';
    ctx.fillStyle = colorB;
    ctx.font = 'bold 50px "Teko", sans-serif';
    ctx.fillText(teamBName, boxBX + boxSize / 2, boxAY + boxSize + 60);

    // 5. Chamada de Premiação e Transmissão
    ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.fillRect(160, 1200, w - 320, 90);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 1200, w - 320, 90);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 36px "Chakra Petch", sans-serif';
    ctx.fillText('🔴 TRANSMISSÃO AO VIVO NA TWITCH', w / 2, 1256);

    ctx.fillStyle = '#ece8e1';
    ctx.font = 'bold 30px "Chakra Petch", sans-serif';
    ctx.fillText('VALENDO 1.000 VP POR JOGADOR CAMPEÃO + R$ 40 PIX', w / 2, 1340);

    // 6. Rodapé: Patrocinadores Oficiais
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 26px "Chakra Petch", sans-serif';
    ctx.fillText('PATROCÍNIO MASTER: NaMoGrafic • Monteiro\'s Pet', w / 2, 1660);

    ctx.fillStyle = '#8b97a2';
    ctx.font = '24px "Chakra Petch", sans-serif';
    ctx.fillText('PATROCINADORES: D. Alves 3D • Trajano.Sports', w / 2, 1705);

    ctx.fillStyle = '#ff4655';
    ctx.font = 'bold 36px "Teko", sans-serif';
    ctx.fillText('ORGANIZAÇÃO & INFORMAÇÕES: @QNTCUP', w / 2, 1800);
  }

  [matchTeamASelect, matchTeamBSelect, matchPhaseSelect, matchDateInput].forEach((input) => {
    input?.addEventListener('change', renderMatchDayCanvas);
    input?.addEventListener('input', renderMatchDayCanvas);
  });

  // Download do Card Match Day
  btnDownloadMatchDay?.addEventListener('click', () => {
    if (!matchDayCanvas) return;
    playTacticalClick(900, 0.08);

    try {
      matchDayCanvas.toBlob((blob) => {
        if (!blob) {
          const dataUrl = matchDayCanvas.toDataURL('image/png');
          triggerMatchDayDownload(dataUrl);
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        triggerMatchDayDownload(blobUrl);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }, 'image/png');
    } catch (e) {
      try {
        const dataUrl = matchDayCanvas.toDataURL('image/png');
        triggerMatchDayDownload(dataUrl);
      } catch (err) {
        showToast('Erro ao exportar card');
      }
    }
  });

  function triggerMatchDayDownload(href) {
    const link = document.createElement('a');
    link.download = 'qntcup-matchday-confronto.png';
    link.href = href;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccessTone();
    showToast('📸 Card Match Day baixado com sucesso!');
  }


  // Tap Ripple no Celular
  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (!touch) return;

    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    ripple.style.left = touch.clientX + 'px';
    ripple.style.top = touch.clientY + 'px';
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 450);
  }, { passive: true });
});
