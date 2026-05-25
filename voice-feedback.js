// Voice Feedback Module
console.log('🎤 Voice Feedback Module Loading...');

// Global state
window.voiceEnabled = localStorage.getItem('voiceEnabled') === 'true';
window.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
window.voiceRecognition = null;
window.speechSynthesis = window.speechSynthesis || window.webkitSpeechSynthesis;

// DOM Elements
const voiceToggle = document.getElementById('voice-toggle');
const ttsToggle = document.getElementById('tts-toggle');

// Initialize
initVoiceControls();

function initVoiceControls() {
    // Set initial states
    updateVoiceButton();
    updateTTSButton();

    // Voice toggle event
    voiceToggle.addEventListener('click', toggleVoiceInput);

    // TTS toggle event
    ttsToggle.addEventListener('click', toggleTextToSpeech);

    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceToggle.disabled = true;
        voiceToggle.innerHTML = '<i class="fas fa-microphone-slash"></i> Not Supported';
        voiceToggle.title = 'Voice input not supported in your browser';
    }

    if (!speechSynthesis) {
        ttsToggle.disabled = true;
        ttsToggle.innerHTML = '<i class="fas fa-volume-mute"></i> Not Supported';
        ttsToggle.title = 'Text-to-speech not supported in your browser';
    }

    console.log('✅ Voice controls initialized');
}

function toggleVoiceInput() {
    window.voiceEnabled = !window.voiceEnabled;
    localStorage.setItem('voiceEnabled', window.voiceEnabled);

    if (window.voiceEnabled) {
        startVoiceRecognition();
        speakText("Voice input activated. Say your design prompt.");
    } else {
        stopVoiceRecognition();
        speakText("Voice input deactivated.");
    }

    updateVoiceButton();
}

function toggleTextToSpeech() {
    window.soundEnabled = !window.soundEnabled;
    localStorage.setItem('soundEnabled', window.soundEnabled);

    if (window.soundEnabled) {
        speakText("Voice feedback activated.");
    } else {
        speechSynthesis.cancel();
        speakText("Voice feedback deactivated.");
    }

    updateTTSButton();
}

function updateVoiceButton() {
    if (window.voiceEnabled) {
        voiceToggle.classList.add('active');
        voiceToggle.innerHTML = '<i class="fas fa-microphone"></i> Listening...';
    } else {
        voiceToggle.classList.remove('active');
        voiceToggle.innerHTML = '<i class="fas fa-microphone"></i> Voice Input';
    }
}

function updateTTSButton() {
    if (window.soundEnabled) {
        ttsToggle.classList.add('active');
        ttsToggle.innerHTML = '<i class="fas fa-volume-up"></i> Feedback On';
    } else {
        ttsToggle.classList.remove('active');
        ttsToggle.innerHTML = '<i class="fas fa-volume-up"></i> Voice Feedback';
    }
}

function startVoiceRecognition() {
    if (window.voiceRecognition) {
        window.voiceRecognition.stop();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    window.voiceRecognition = new SpeechRecognition();

    window.voiceRecognition.continuous = true;
    window.voiceRecognition.interimResults = true;
    window.voiceRecognition.lang = 'en-US';

    window.voiceRecognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update input with interim results
        const promptInput = document.getElementById('prompt-input');
        if (interimTranscript) {
            promptInput.value = interimTranscript;
        }

        // Process final result
        if (finalTranscript) {
            promptInput.value = finalTranscript;
            speakText(`Got it: ${finalTranscript}. Press generate when ready.`);

            // Auto-generate for certain commands
            const lowerTranscript = finalTranscript.toLowerCase();
            if (lowerTranscript.includes('generate') || lowerTranscript.includes('create')) {
                setTimeout(() => {
                    document.getElementById('generate-btn').click();
                }, 1000);
            }
        }
    };

    window.voiceRecognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        if (event.error === 'not-allowed') {
            speakText("Please allow microphone access for voice input.");
        }
    };

    window.voiceRecognition.onend = () => {
        if (window.voiceEnabled) {
            setTimeout(() => {
                window.voiceRecognition.start();
            }, 100);
        }
    };

    try {
        window.voiceRecognition.start();
        console.log('🎤 Voice recognition started');
    } catch (error) {
        console.error('Failed to start voice recognition:', error);
    }
}

function stopVoiceRecognition() {
    if (window.voiceRecognition) {
        window.voiceRecognition.stop();
        window.voiceRecognition = null;
        console.log('🎤 Voice recognition stopped');
    }
}

function speakText(text, rate = 1.0, pitch = 1.0) {
    if (!window.soundEnabled || !speechSynthesis) return;

    speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 0.8;

    // Select a voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
        voice.lang.includes('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.includes('en'));

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
        console.log('🔊 Speaking:', text);
    };

    utterance.onerror = (event) => {
        console.error('Speech error:', event);
    };

    speechSynthesis.speak(utterance);
}

// Predefined voice responses
const voiceResponses = {
    generating: [
        "Starting generation process. Enhancing your prompt with AI.",
        "Processing your design vision through multiple AI models.",
        "Creating your dream space with advanced neural networks.",
        "Transforming your idea into a photorealistic interior design."
    ],
    success: [
        "Generation complete! Your interior design is ready.",
        "Successfully created your dream space.",
        "Your AI-generated design is now available.",
        "Design complete and ready for viewing."
    ],
    error: [
        "Sorry, there was an issue with generation. Please try again.",
        "Generation failed. Please check your connection.",
        "Unable to process at the moment. Please retry.",
        "There was a problem with the AI service."
    ]
};

function getRandomResponse(type) {
    const responses = voiceResponses[type];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Export functions for main.js
window.speakText = speakText;
window.getRandomResponse = getRandomResponse;

// Initialize voices when available
speechSynthesis.onvoiceschanged = () => {
    console.log('🗣️ Voices loaded:', speechSynthesis.getVoices().length);
};

console.log('✅ Voice Feedback Module Ready');