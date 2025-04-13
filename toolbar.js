/**
     * Elastic Toolbar with Konami Code, Physics, and Sound
     * This script creates an interactive toolbar that appears when the Konami code is entered.
     * The toolbar can be dragged around with realistic physics, play different mood music,
     * and place stamps on the page.
     */
    
    (function() {
        // Load Tone.js for sound capabilities
        function loadToneJS() {
            return new Promise((resolve, reject) => {
                const toneScript = document.createElement('script');
                toneScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';
                toneScript.onload = resolve;
                toneScript.onerror = reject;
                document.head.appendChild(toneScript);
            });
        }
    
        // Add CSS to the document
        function addStyles() {
            const style = document.createElement('style');
            style.textContent = `
                body {
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                    font-family: Arial, sans-serif;
                }
    
                #elastic-toolbar-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    pointer-events: none;
                    z-index: 9998;
                }
    
                #elastic-toolbar {
                    position: absolute;
                    width: 300px;
                    height: 60px;
                    background-color: #4a90e2;
                    border: 3px solid #2a70c2;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    z-index: 10;
                    opacity: 0;
                    transform: translateY(100px);
                    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
                    pointer-events: all;
                }
    
                #elastic-toolbar.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
    
                .tool-button {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: white;
                    border: 2px solid #2a70c2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-weight: bold;
                    font-size: 18px;
                    color: #2a70c2;
                    cursor: pointer;
                }
    
                #handle-container {
                    position: relative;
                    width: 40px;
                    height: 40px;
                }
    
                #handle {
                    position: absolute;
                    width: 35px;
                    height: 35px;
                    background-color: #ff5252;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                    cursor: grab;
                    z-index: 20;
                    top: 0;
                    left: 0;
                }
    
                #draggable-handle {
                    position: absolute;
                    width: 35px;
                    height: 35px;
                    background-color: #ff5252;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                    cursor: grabbing;
                    z-index: 30;
                    display: none;
                    pointer-events: none;
                }
    
                #rubber-band {
                    position: absolute;
                    height: 4px;
                    background-color: #ff5252;
                    opacity: 0.8;
                    z-index: 15;
                    transform-origin: 0% 50%;
                    border-radius: 2px;
                    pointer-events: none;
                }
    
                #mood-knob {
                    width: 40px;
                    height: 40px;
                    background: rgb(33, 33, 33);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                    transition: transform 0.3s ease;
                }
    
                #stamp-button {
                    width: 40px;
                    height: 40px;
                    background: #2196F3;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
    
                #stamp-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                }
    
                @keyframes stampPop {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
    
                .stamp {
                    position: absolute;
                    font-size: 20px;
                    pointer-events: none;
                    animation: stampPop 0.3s ease-out;
                    z-index: 9999;
                }
            `;
            document.head.appendChild(style);
        }
    
        // Create toolbar and all related elements
        function createElements() {
            // Create container
            const container = document.createElement('div');
            container.id = 'elastic-toolbar-container';
            document.body.appendChild(container);
    
            // Create toolbar
            const toolbar = document.createElement('div');
            toolbar.id = 'elastic-toolbar';
            container.appendChild(toolbar);
    
            // Create A, B, C buttons
            const buttonA = document.createElement('div');
            buttonA.className = 'tool-button';
            buttonA.textContent = 'A';
            toolbar.appendChild(buttonA);
    
            const buttonB = document.createElement('div');
            buttonB.className = 'tool-button';
            buttonB.textContent = 'B';
            toolbar.appendChild(buttonB);
    
            const buttonC = document.createElement('div');
            buttonC.className = 'tool-button';
            buttonC.textContent = 'C';
            toolbar.appendChild(buttonC);
    
            // Create mood knob
            const moodKnob = document.createElement('div');
            moodKnob.id = 'mood-knob';
            moodKnob.textContent = '😇';
            toolbar.appendChild(moodKnob);
    
            // Create stamp button
            const stampButton = document.createElement('div');
            stampButton.id = 'stamp-button';
            stampButton.innerHTML = '⭐';
            toolbar.appendChild(stampButton);
    
            // Create handle container and handle
            const handleContainer = document.createElement('div');
            handleContainer.id = 'handle-container';
            toolbar.appendChild(handleContainer);
    
            const handle = document.createElement('div');
            handle.id = 'handle';
            handleContainer.appendChild(handle);
    
            // Create draggable handle (follows mouse during drag)
            const draggableHandle = document.createElement('div');
            draggableHandle.id = 'draggable-handle';
            container.appendChild(draggableHandle);
    
            // Create rubber band
            const rubberBand = document.createElement('div');
            rubberBand.id = 'rubber-band';
            container.appendChild(rubberBand);
    
            // Create stamp container
            const stampContainer = document.createElement('div');
            stampContainer.id = 'stamp-container';
            document.body.appendChild(stampContainer);
    
            return {
                container,
                toolbar,
                handle,
                draggableHandle,
                rubberBand,
                moodKnob,
                stampButton,
                stampContainer
            };
        }
    
        // Initialize the toolbar with physics properties
        function initializeToolbar(elements, isAlreadyOpen = false) {
            const { toolbar, handle, draggableHandle, rubberBand, moodKnob, stampButton, stampContainer } = elements;
    
            // Physics constants
            const SPRING_STRENGTH = 0.025;
            const FRICTION = 0.98;
            const BOUNCE = 0.85;
            const MAX_STRETCH = 300;
            const GRAVITY = 0.25;
            const ROTATION_GRAVITY = 0.005;
    
            // Viewport dimensions
            let viewportWidth = window.innerWidth;
            let viewportHeight = window.innerHeight;
    
            // Toolbar dimensions
            const toolbarWidth = 300;
            const toolbarHeight = 60;
    
                        // State variables
            let toolbarX = viewportWidth / 2;
            let toolbarY = viewportHeight - 16 - toolbarHeight / 2;
            let toolbarAngle = 0;
            let velX = 0;
            let velY = 0;
            let angularVel = 0;
            
            // Flag to track if the toolbar has been pulled (physics enabled only after first pull)
            let hasBeenPulled = false;
    
            // Handle variables
            let isDragging = false;
            let anchorX = 0;
            let anchorY = 0;
    
            // Stamp variables
            let isStampMode = false;
            const stampImage = '⭐';
    
            // Audio variables
            let synth;
            let pattern;
            const moods = ['Calm', 'Energetic', 'Dreamy', 'Off'];
            let currentMoodIndex = 0;
            let rotation = 0;
    
            // Initialize positions
            updateToolbarPosition();
    
            // Initialize audio
            function initializeAudio() {
                synth = new Tone.PolySynth().toDestination();
                synth.volume.value = -20;
    
                const patterns = {
                    Calm: {
                        notes: [
                            // D major chord structure variations
                            { note: 'D3', duration: '4n', velocity: 0.4 },
                            { note: 'A3', duration: '2n', velocity: 0.35 },
                            { note: 'F#4', duration: '4n', velocity: 0.3 },
                            { note: 'B4', duration: '2n', velocity: 0.25 },
                            { note: 'E5', duration: '4n', velocity: 0.2 },
                            
                            // G major chord structure variations
                            { note: 'G3', duration: '2n', velocity: 0.4 },
                            { note: 'B3', duration: '4n', velocity: 0.35 },
                            { note: 'D4', duration: '2n', velocity: 0.3 },
                            { note: 'G4', duration: '4n', velocity: 0.25 },
                            { note: 'C5', duration: '2n', velocity: 0.2 },
                            
                            // A major/minor chord structure variations
                            { note: 'A3', duration: '4n', velocity: 0.38 },
                            { note: 'E4', duration: '2n', velocity: 0.32 },
                            { note: 'A4', duration: '4n', velocity: 0.28 },
                            { note: 'C5', duration: '2n', velocity: 0.24 },
                            { note: 'F5', duration: '4n', velocity: 0.18 },
                            
                            // F# minor chord structure variations
                            { note: 'F#3', duration: '2n', velocity: 0.42 },
                            { note: 'C#4', duration: '4n', velocity: 0.36 },
                            { note: 'F#4', duration: '2n', velocity: 0.3 },
                            { note: 'A4', duration: '4n', velocity: 0.26 },
                            { note: 'D5', duration: '2n', velocity: 0.22 },
                            
                            // B minor chord structure variations
                            { note: 'B3', duration: '4n', velocity: 0.38 },
                            { note: 'D4', duration: '2n', velocity: 0.33 },
                            { note: 'F#4', duration: '4n', velocity: 0.28 },
                            { note: 'B4', duration: '2n', velocity: 0.24 },
                            { note: 'E5', duration: '4n', velocity: 0.19 },
                            
                            // E major chord structure variations
                            { note: 'E3', duration: '2n', velocity: 0.37 },
                            { note: 'B3', duration: '4n', velocity: 0.32 },
                            { note: 'E4', duration: '2n', velocity: 0.28 },
                            { note: 'G#4', duration: '4n', velocity: 0.23 },
                            { note: 'B4', duration: '2n', velocity: 0.18 },
                            
                            // A major chord structure variations
                            { note: 'A3', duration: '4n', velocity: 0.4 },
                            { note: 'C#4', duration: '2n', velocity: 0.35 },
                            { note: 'E4', duration: '4n', velocity: 0.3 },
                            { note: 'A4', duration: '2n', velocity: 0.25 },
                            { note: 'C#5', duration: '4n', velocity: 0.2 },
                            
                            // Back to D major chord structure variations
                            { note: 'D3', duration: '2n', velocity: 0.42 },
                            { note: 'A3', duration: '4n', velocity: 0.37 },
                            { note: 'D4', duration: '2n', velocity: 0.32 },
                            { note: 'F#4', duration: '4n', velocity: 0.27 },
                            { note: 'A4', duration: '2n', velocity: 0.22 }
                        ],
                        timing: [
                            // Alternating between quarter and half notes for gentle flow
                            '4n', '2n', '4n', '2n', '4n', '2n', '4n', '2n', '4n', '2n',
                            '4n', '2n', '4n', '2n', '4n', '2n', '4n', '2n', '4n', '2n',
                            '4n', '2n', '4n', '2n', '4n', '2n', '4n', '2n', '4n', '2n',
                            '4n', '2n', '4n', '2n', '4n', '2n', '4n', '2n', '4n', '2n'
                        ],
                        probability: {
                            overall: 0.2,
                            // Higher probabilities for bass and lower for high notes creates groundedness
                            noteSpecific: [
                                0.30, 0.28, 0.25, 0.20, 0.15, // D major probabilities
                                0.30, 0.28, 0.25, 0.20, 0.15, // G major probabilities
                                0.30, 0.26, 0.24, 0.20, 0.15, // A major/minor probabilities
                                0.32, 0.29, 0.25, 0.20, 0.16, // F# minor probabilities
                                0.31, 0.27, 0.24, 0.20, 0.15, // B minor probabilities
                                0.30, 0.26, 0.23, 0.19, 0.14, // E major probabilities
                                0.30, 0.28, 0.25, 0.20, 0.15, // A major probabilities
                                0.32, 0.29, 0.25, 0.20, 0.16  // D major probabilities
                            ]
                        },
                        swing: 0.08, // Very slight swing for natural feel without disrupting calm
                        arpeggioPattern: 'upDown', // Gentle up and down pattern for smooth transitions
                        reverb: {
                            decayTime: 2.2, // Moderate reverb for spaciousness without overwhelming
                            wetLevel: 0.35, // Subtle reverb mix
                            preDelay: 0.02 // Small predelay for clarity
                        },
                        sustain: 0.65, // Medium sustain for connectedness without muddiness
                        attack: 0.25, // Soft attack for gentle note entries
                        release: 1.5, // Long release for smooth transitions between notes
                        delay: {
                            time: '8n', 
                            feedback: 0.15, // Light feedback for subtle echoes
                            wet: 0.25 // Low wet level for subtlety
                        },
                        drift: { // Minimal pitch drift for organic quality
                            amount: 0.03,
                            rate: 0.02
                        },
                        velocityVariation: {
                            amount: 0.08, // Subtle velocity variations for natural feeling
                            pattern: [1, 0.9, 0.95, 0.85, 0.9, 0.95, 0.85, 0.9] // Gentle undulation
                        },
                        chord: {
                            enabled: true,
                            types: ['major', 'minor', 'sus2'], // Simple, calm chord types
                            voicing: 'open', // Open voicings for spaciousness
                            probability: 0.15 // Occasional chords
                        },
                        filter: {
                            type: 'lowpass',
                            frequency: 2000, // Moderate cutoff that allows clarity while removing harshness
                            resonance: 0.8, // Low resonance for smoothness
                            modulation: {
                                rate: 0.05, // Very slow modulation
                                depth: 200 // Gentle frequency shift
                            }
                        },
                        tempo: {
                            bpm: 72, // Slow, relaxed tempo (heart rate at rest)
                            variation: 0.02 // Minimal tempo fluctuation for natural feel
                        },
                        sequenceMode: 'sequential', // Play through progressions in order
                        transitionProbability: 0.1, // Low chance of jumping to different chord group
                        harmonySettings: {
                            voiceLeading: true, // Smooth voice leading between chord changes
                            bassEmphasis: 0.3 // Slight emphasis on bass notes for grounding
                        }
                    },
                    Energetic: {
                        notes: [
                            { note: 'C4', duration: '16n', velocity: 0.7 },
                            { note: 'E4', duration: '8n', velocity: 0.8 },
                            { note: 'G4', duration: '16n', velocity: 0.7 },
                            { note: 'A4', duration: '8n', velocity: 0.9 },
                            { note: 'C5', duration: '16n', velocity: 0.8 },
                            { note: 'D5', duration: '32n', velocity: 0.6 },
                            { note: 'E5', duration: '16n', velocity: 0.9 },
                            { note: 'G5', duration: '8n', velocity: 1.0 },
                            { note: 'F5', duration: '16n', velocity: 0.8 },
                            { note: 'D5', duration: '8n', velocity: 0.7 },
                            { note: 'B4', duration: '16n', velocity: 0.6 },
                            { note: 'G4', duration: '4n', velocity: 0.9 }
                        ],
                        timing: [
                            '16n', '8n', '16n', '8n', '16n', '32n', '16n', '8n', '16n', '8n', '16n', '4n'
                        ],
                        probability: {
                            overall: 0.8,
                            noteSpecific: [0.9, 0.8, 0.7, 0.9, 0.8, 0.6, 0.9, 1.0, 0.8, 0.7, 0.6, 0.9]
                        },
                        swing: 0.3,
                        arpeggioPattern: 'upDown', // Options: 'up', 'down', 'upDown', 'random'
                        accent: [1, 0, 0, 1, 0, 0, 1, 0], // Accent pattern for rhythmic emphasis
                        octaveShift: {
                            pattern: [0, 0, 0, 1, 0, 0, -1, 0], // Occasional octave jumps
                            probability: 0.4
                        },
                        velocityVariation: {
                            amount: 0.2, // Random velocity variation amount
                            pattern: [1, 0.8, 0.9, 1, 0.7, 0.8, 1, 0.9] // Velocity multiplier pattern
                        }
                    },
                    Dreamy: {
                        notes: [
                            { note: 'D4', duration: '2n', velocity: 0.5 },
                            { note: 'F#4', duration: '4n', velocity: 0.4 },
                            { note: 'A4', duration: '2n', velocity: 0.6 },
                            { note: 'C5', duration: '1n', velocity: 0.3 },
                            { note: 'E5', duration: '2n', velocity: 0.4 },
                            { note: 'B4', duration: '4n', velocity: 0.5 },
                            { note: 'G4', duration: '2n', velocity: 0.3 },
                            { note: 'A4', duration: '1n', velocity: 0.4 },
                            { note: 'F#5', duration: '2n', velocity: 0.2 },
                            { note: 'D5', duration: '2n', velocity: 0.3 }
                        ],
                        timing: [
                            '2n', '4n', '2n', '1n', '2n', '4n', '2n', '1n', '2n', '2n'
                        ],
                        probability: {
                            overall: 0.4,
                            noteSpecific: [0.5, 0.4, 0.6, 0.3, 0.4, 0.5, 0.3, 0.4, 0.2, 0.3]
                        },
                        swing: 0.1, // Minimal swing for a floating feel
                        arpeggioPattern: 'random', // Random note selection for dreamlike unpredictability
                        reverb: {
                            decayTime: 4.0,
                            wetLevel: 0.7
                        },
                        sustain: 0.8, // Long sustain for overlapping notes
                        attack: 0.2, // Soft attack for gentle note entries
                        release: 2.0, // Long release for notes to fade gently
                        delay: {
                            time: '8n', 
                            feedback: 0.4,
                            wet: 0.5
                        },
                        drift: { // Subtle pitch drift for ethereal quality
                            amount: 0.07,
                            rate: 0.05
                        },
                        velocityVariation: {
                            amount: 0.1, // Gentle velocity variations
                            pattern: [0.9, 0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.6, 0.9, 0.7]
                        },
                        octaveShift: {
                            pattern: [0, 0, 0, 1, 0, -1, 0, 0, 1, 0], // Occasional octave shifts
                            probability: 0.3
                        },
                        chord: {
                            enabled: true,
                            types: ['maj7', 'min9', 'sus4'], // Dreamy chord types
                            probability: 0.35
                        },
                        filter: {
                            type: 'lowpass',
                            frequency: 1500,
                            resonance: 2,
                            modulation: {
                                rate: 0.1,
                                depth: 400
                            }
                        }
                    }
                };
    
                function updateMood(mood) {
                    if (pattern) {
                        pattern.stop();
                    }
    
                    if (mood === 'Off') {
                        return;
                    }
    
                    const currentPattern = patterns[mood];
                    pattern = new Tone.Pattern((time, note) => {
                        if (Math.random() < currentPattern.probability) {
                            synth.triggerAttackRelease(note, '8n', time);
                        }
                    }, currentPattern.notes);
    
                    pattern.interval = currentPattern.timing;
                    Tone.Transport.start();
                    pattern.start();
                }
    
                moodKnob.addEventListener('click', async () => {
                    if (currentMoodIndex === 0) {
                        await Tone.start();
                    }
    
                    rotation += 90;
                    moodKnob.style.transform = `rotate(${rotation}deg)`;
    
                    currentMoodIndex = (currentMoodIndex + 1) % moods.length;
                    const newMood = moods[currentMoodIndex];
                    moodKnob.textContent = newMood === 'Off' ? '😴' : 
                                        newMood === 'Calm' ? '😇' : 
                                        newMood === 'Energetic' ? '🔥' : '✨';
    
                    const colors = {
                        Calm: '#4CAF50',
                        Energetic: '#FF5722',
                        Dreamy: '#9C27B0',
                        Off: '#757575'
                    };
                    moodKnob.style.background = colors[newMood];
    
                    updateMood(newMood);
                });
            }
    
            // Event Handlers
            function updateViewportDimensions() {
                viewportWidth = window.innerWidth;
                viewportHeight = window.innerHeight;
    
                // Reset toolbar position to exactly 16px from bottom
                toolbarX = viewportWidth / 2;
                toolbarY = viewportHeight - 16 - toolbarHeight / 2;
    
                // Reset velocities
                velX = 0;
                velY = 0;
                angularVel = 0;
                toolbarAngle = 0;
                
                // Reset the pull flag when window is resized
                hasBeenPulled = false;
                
                // Force exact positioning with precise 16px gap from bottom
                toolbar.style.left = `${toolbarX - toolbarWidth/2}px`;
                toolbar.style.top = `${viewportHeight - 16 - toolbarHeight}px`;
                toolbar.style.transform = `rotate(0rad)`;
            }
    
            function updateToolbarPosition() {
                // Only use calculated physics position if the toolbar has been pulled
                if (hasBeenPulled) {
                    toolbar.style.left = `${toolbarX - toolbarWidth / 2}px`;
                    toolbar.style.top = `${toolbarY - toolbarHeight / 2}px`;
                    toolbar.style.transform = `rotate(${toolbarAngle}rad)`;
                } else {
                    // Otherwise maintain exact 16px from bottom positioning
                    toolbar.style.left = `${toolbarX - toolbarWidth / 2}px`;
                    toolbar.style.top = `${viewportHeight - 16 - toolbarHeight}px`;
                    toolbar.style.transform = `rotate(0rad)`;
                }
            }
    
            function getHandlePosition() {
                const rect = handle.getBoundingClientRect();
                return {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            }
    
            function startDrag(e) {
                e.preventDefault();
                isDragging = true;
    
                // Get handle position
                const handlePos = getHandlePosition();
                anchorX = handlePos.x;
                anchorY = handlePos.y;
    
                // Get mouse/touch position
                const pos = getEventPosition(e);
    
                // Position draggable handle
                draggableHandle.style.display = 'block';
                draggableHandle.style.left = `${pos.x - 17.5}px`;
                draggableHandle.style.top = `${pos.y - 17.5}px`;
    
                // Hide original handle
                handle.style.opacity = '0.5';
    
                // Stop motion
                velX = 0;
                velY = 0;
                angularVel = 0;
    
                // Update rubber band
                updateRubberBand(pos.x, pos.y);
            }
    
            function onDrag(e) {
                if (!isDragging) return;
                e.preventDefault();
    
                // Get mouse/touch position
                const pos = getEventPosition(e);
    
                // Calculate distance from anchor
                const dx = pos.x - anchorX;
                const dy = pos.y - anchorY;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                let mouseX = pos.x;
                let mouseY = pos.y;
    
                // Apply max stretch limit
                if (distance > MAX_STRETCH) {
                    const ratio = MAX_STRETCH / distance;
                    mouseX = anchorX + dx * ratio;
                    mouseY = anchorY + dy * ratio;
                }
    
                // Update draggable handle position
                draggableHandle.style.left = `${mouseX - 17.5}px`;
                draggableHandle.style.top = `${mouseY - 17.5}px`;
    
                // Update rubber band
                updateRubberBand(mouseX, mouseY);
            }
    
            function updateRubberBand(endX, endY) {
                // Calculate rubber band properties
                const dx = endX - anchorX;
                const dy = endY - anchorY;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
    
                // Position rubber band
                rubberBand.style.width = `${length}px`;
                rubberBand.style.left = `${anchorX}px`;
                rubberBand.style.top = `${anchorY - 2}px`;
                rubberBand.style.transform = `rotate(${angle}rad)`;
                rubberBand.style.display = 'block';
            }
    
            function endDrag(e) {
                if (!isDragging) return;
                isDragging = false;
    
                // Get current mouse position
                const pos = getEventPosition(e);
    
                // Calculate spring force
                const dx = anchorX - pos.x;
                const dy = anchorY - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                // Only apply physics if there was a meaningful drag (to avoid accidental clicks)
                if (distance > 10) {
                    // Mark that the toolbar has been pulled at least once
                    hasBeenPulled = true;
                    
                    // Apply force
                    velX = dx * SPRING_STRENGTH;
                    velY = dy * SPRING_STRENGTH;
    
                    // Calculate rotation
                    const handlePos = getHandlePosition();
                    const offCenterX = (handlePos.x - toolbarX) / (toolbarWidth / 2);
                    const pullAngle = Math.atan2(dy, dx);
    
                    // Apply rotation
                    angularVel = offCenterX * 0.8 * Math.sin(pullAngle);
    
                    // Add more force for longer pulls
                    const forceFactor = Math.min(1, distance / 150);
                    velX *= (1 + forceFactor);
                    velY *= (1 + forceFactor);
                }
    
                // Hide draggable handle and rubber band
                draggableHandle.style.display = 'none';
                rubberBand.style.display = 'none';
    
                // Restore original handle
                handle.style.opacity = '1';
            }
    
            function updatePhysics() {
                // Only apply physics if the toolbar has been pulled at least once
                if (!hasBeenPulled) return;
                
                // Apply gravity
                velY += GRAVITY;
    
                // Apply rotational gravity
                let normalizedAngle = toolbarAngle % (Math.PI * 2);
                if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
    
                // Find closest stable angle
                let targetAngle = 0;
                if (normalizedAngle > Math.PI / 2 && normalizedAngle < 3 * Math.PI / 2) {
                    targetAngle = Math.PI;
                }
    
                // Apply rotational force
                const angleDiff = targetAngle - normalizedAngle;
                let normalizedDiff = angleDiff;
                if (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
                if (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
    
                angularVel += normalizedDiff * ROTATION_GRAVITY;
    
                // Update position
                toolbarX += velX;
                toolbarY += velY;
                toolbarAngle += angularVel;
    
                // Apply friction
                velX *= FRICTION;
                velY *= FRICTION;
                angularVel *= FRICTION;
    
                // Use a higher threshold to stop small movements and prevent jittering
                if (Math.abs(velX) < 0.2) velX = 0;
                if (Math.abs(velY) < 0.2) velY = 0;
                if (Math.abs(angularVel) < 0.002) angularVel = 0;
    
                // If all velocities are zero, prevent any further tiny movements
                if (velX === 0 && velY === 0 && angularVel === 0) {
                    return;
                }
    
                // Snap to nearest flat orientation
                if (angularVel === 0 && Math.abs(normalizedDiff) < 0.1) {
                    toolbarAngle = targetAngle;
                }
    
                // Handle boundaries
                checkBoundaries();
    
                // Update position
                updateToolbarPosition();
            }
    
            function checkBoundaries() {
                // Get rotated corners
                const corners = getRotatedCorners();
    
                // Find extremes
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                corners.forEach(point => {
                    minX = Math.min(minX, point.x);
                    maxX = Math.max(maxX, point.x);
                    minY = Math.min(minY, point.y);
                    maxY = Math.max(maxY, point.y);
                });
    
                // Boundary checks with bounce effects
                if (minX < 0) {
                    toolbarX += Math.abs(minX);
                    velX = Math.abs(velX) * BOUNCE;
                    velY += (Math.random() * 2 - 1) * Math.abs(velX) * 0.3;
                    angularVel = Math.abs(angularVel) * 1.2;
                }
    
                if (maxX > viewportWidth) {
                    toolbarX -= (maxX - viewportWidth);
                    velX = -Math.abs(velX) * BOUNCE;
                    velY += (Math.random() * 2 - 1) * Math.abs(velX) * 0.3;
                    angularVel = -Math.abs(angularVel) * 1.2;
                }
    
                if (minY < 0) {
                    toolbarY += Math.abs(minY);
                    velY = Math.abs(velY) * BOUNCE;
                    velX += (Math.random() * 2 - 1) * Math.abs(velY) * 0.3;
                    angularVel *= -BOUNCE * 1.2;
                }
    
                if (maxY > viewportHeight) {
                    toolbarY -= (maxY - viewportHeight);
                    velY = -Math.abs(velY) * BOUNCE;
                    velX += (Math.random() * 2 - 1) * Math.abs(velY) * 0.3;
                    angularVel *= -BOUNCE * 1.2;
                }
            }
    
            function getRotatedCorners() {
                const halfWidth = toolbarWidth / 2;
                const halfHeight = toolbarHeight / 2;
    
                // Define corners relative to center
                const corners = [
                    { x: -halfWidth, y: -halfHeight },
                    { x: halfWidth, y: -halfHeight },
                    { x: halfWidth, y: halfHeight },
                    { x: -halfWidth, y: halfHeight }
                ];
    
                // Apply rotation and translation
                return corners.map(corner => {
                    const rotatedX = corner.x * Math.cos(toolbarAngle) - corner.y * Math.sin(toolbarAngle);
                    const rotatedY = corner.x * Math.sin(toolbarAngle) + corner.y * Math.cos(toolbarAngle);
    
                    return {
                        x: rotatedX + toolbarX,
                        y: rotatedY + toolbarY
                    };
                });
            }
    
            function getEventPosition(e) {
                if (e.type.includes('touch')) {
                    return {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };
                } else {
                    return {
                        x: e.clientX,
                        y: e.clientY
                    };
                }
            }
    
            function animate() {
                if (!isDragging) {
                    updatePhysics();
                }
                requestAnimationFrame(animate);
            }
    
            function toggleStampMode() {
                isStampMode = !isStampMode;
                document.body.style.cursor = isStampMode ? 'crosshair' : 'default';
                stampButton.style.background = isStampMode ? '#FF5722' : '#2196F3';
            }
    
            function addStamp(e) {
                if (!isStampMode || e.target === moodKnob || e.target === stampButton || 
                    e.target === handle || e.target.classList.contains('tool-button')) return;
    
                const stamp = document.createElement('div');
                stamp.className = 'stamp';
                stamp.style.left = `${e.pageX - 10}px`;
                stamp.style.top = `${e.pageY - 10}px`;
                stamp.textContent = stampImage;
                stampContainer.appendChild(stamp);
            }
    
            function updateStampContainerHeight() {
                const docHeight = Math.max(
                    document.body.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.clientHeight,
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight
                );
                stampContainer.style.height = `${docHeight}px`;
            }
    
            function showToolbar() {
                // Set the localStorage flag that toolbar has been opened
                localStorage.setItem('elasticToolbarOpened', 'true');
                
                // Position toolbar initially below the viewport
                toolbarX = viewportWidth / 2;
                toolbarY = viewportHeight - 16 - toolbarHeight / 2;
                toolbarAngle = 0;
                velX = 0;
                velY = 0;
                angularVel = 0;
                
                // Reset the pull flag - physics disabled until first pull
                hasBeenPulled = false;
    
                // Position initially below the screen
                toolbar.style.left = `${toolbarX - toolbarWidth/2}px`;
                toolbar.style.top = `${viewportHeight + 30}px`; // Start from below the screen
                toolbar.style.transform = `rotate(0rad)`;
                
                // Force a reflow to ensure the initial position is applied
                toolbar.offsetHeight;
                
                // Move to correct position with a snappier animation
                toolbar.style.transition = 'top 0.3s cubic-bezier(0.15, 1.25, 0.5, 1.2), opacity 0.2s ease-out';
                toolbar.style.top = `${viewportHeight - 16 - toolbarHeight}px`;
                
                // Make toolbar visible with a slight delay for the animation effect
                setTimeout(() => {
                    toolbar.classList.add('visible');
                }, 20);
                
                // Remove the transition after animation completes
                setTimeout(() => {
                    toolbar.style.transition = '';
                }, 350);
                
                // If Tone.js is loaded, initialize audio
                if (typeof Tone !== 'undefined') {
                    initializeAudio();
                } else {
                    loadToneJS().then(() => {
                        initializeAudio();
                    });
                }
            }
    
            function resetToolbarPosition() {
                // Stop all motion
                velX = 0;
                velY = 0;
                angularVel = 0;
                
                // Reset the pull flag - physics disabled until next pull
                hasBeenPulled = false;
    
                // Animate toolbar back to bottom center with a snappier animation
                toolbar.style.transition = 'left 0.25s cubic-bezier(0.15, 1.15, 0.5, 1.1), top 0.25s cubic-bezier(0.15, 1.15, 0.5, 1.1), transform 0.25s cubic-bezier(0.15, 1.15, 0.5, 1.1)';
    
                // Set new position - exactly 16px from bottom of viewport
                toolbarX = viewportWidth / 2;
                toolbarY = viewportHeight - 16 - toolbarHeight / 2;
                toolbarAngle = 0;
                
                // Force exact positioning
                toolbar.style.left = `${toolbarX - toolbarWidth/2}px`;
                toolbar.style.top = `${viewportHeight - 16 - toolbarHeight}px`;
                toolbar.style.transform = `rotate(0rad)`;
    
                // Reset transition after animation completes
                setTimeout(() => {
                    toolbar.style.transition = '';
                }, 300);
            }
    
            // Play achievement sound when Konami code is entered
            function playAchievementSound() {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create oscillators for a fun achievement sound
                const osc1 = audioContext.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                osc1.frequency.exponentialRampToValueAtTime(987.77, audioContext.currentTime + 0.2); // B5
                
                const osc2 = audioContext.createOscillator();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                osc2.frequency.exponentialRampToValueAtTime(1318.51, audioContext.currentTime + 0.3); // E6
                
                // Create gain nodes for envelope
                const gain1 = audioContext.createGain();
                gain1.gain.setValueAtTime(0, audioContext.currentTime);
                gain1.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
                gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                
                const gain2 = audioContext.createGain();
                gain2.gain.setValueAtTime(0, audioContext.currentTime);
                gain2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.15);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                // Connect nodes
                osc1.connect(gain1);
                osc2.connect(gain2);
                gain1.connect(audioContext.destination);
                gain2.connect(audioContext.destination);
                
                // Start and stop oscillators
                osc1.start();
                osc2.start(audioContext.currentTime + 0.1);
                osc1.stop(audioContext.currentTime + 0.4);
                osc2.stop(audioContext.currentTime + 0.5);
            }
    
            // Set up event listeners
            window.addEventListener('resize', () => {
                updateViewportDimensions();
                updateStampContainerHeight();
            });
            
            handle.addEventListener('mousedown', startDrag);
            handle.addEventListener('touchstart', startDrag, { passive: false });
            
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('touchmove', onDrag, { passive: false });
            
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
            
            document.addEventListener('click', addStamp);
            stampButton.addEventListener('click', toggleStampMode);
    
            // Konami code and spacebar handling
            const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
            let konamiIndex = 0;
            
            // Spacebar counter
            let spacebarCount = 0;
            let spacebarTimer = null;
            
            document.addEventListener('keydown', (e) => {
                // Skip Konami code check if toolbar is already visible
                if (!toolbar.classList.contains('visible')) {
                    // Check for Konami code
                    if (e.code === konamiCode[konamiIndex]) {
                        konamiIndex++;
                        if (konamiIndex === konamiCode.length) {
                            showToolbar();
                            playAchievementSound();
                            
                            konamiIndex = 0; // Reset for next time
                        }
                    } else {
                        konamiIndex = 0; // Reset on wrong key
                        // If the wrong key was pressed but it's the first key of the sequence, check it
                        if (e.code === konamiCode[0]) {
                            konamiIndex = 1;
                        }
                    }
                }
                
                // Check for spacebar
                if (e.code === 'Space') {
                    spacebarCount++;
                    
                    // Clear existing timeout if there is one
                    if (spacebarTimer) clearTimeout(spacebarTimer);
                    
                    // Set a new timeout to reset counter after 1 second of inactivity
                    spacebarTimer = setTimeout(() => {
                        spacebarCount = 0;
                    }, 1000);
                    
                    // If spacebar pressed 3 times in quick succession
                    if (spacebarCount === 3) {
                        resetToolbarPosition();
                        spacebarCount = 0;
                    }
                }
            });
    
            // Initialize resize observer for stamp container
            const resizeObserver = new ResizeObserver(() => {
                updateStampContainerHeight();
            });
            
            // Observe the body for changes
            resizeObserver.observe(document.body);
    
            // Start animation loop
            requestAnimationFrame(animate);
            
            // Initialize audio if toolbar is already open from localStorage
            if (isAlreadyOpen) {
                loadToneJS().then(() => {
                    initializeAudio();
                });
            }
        }
    
        // Initialize everything when the DOM is fully loaded
        function init() {
            // Add styles to document
            addStyles();
            
            // Create DOM elements
            const elements = createElements();
            
            // Check if toolbar should be visible from localStorage
            const toolbarOpened = localStorage.getItem('elasticToolbarOpened') === 'true';
            
            // Initialize toolbar
            initializeToolbar(elements, toolbarOpened);
            
            // If toolbar was previously opened, show it immediately without animation
            if (toolbarOpened) {
                const { toolbar } = elements;
                
                // Position toolbar exactly 16px from bottom without animation
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const toolbarWidth = 300;
                const toolbarHeight = 60;
                
                toolbar.style.left = `${(viewportWidth / 2) - (toolbarWidth / 2)}px`;
                toolbar.style.top = `${viewportHeight - 16 - toolbarHeight}px`;
                toolbar.style.transform = `rotate(0rad)`;
                toolbar.classList.add('visible');
            }
        }
    
        // Run initialization when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
    