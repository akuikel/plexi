import React, { useState, useEffect, useRef } from 'react';

// Mock Data for Transcripts
const DEMO_DATA = {
    plumbing: {
        label: "Plumbing",
        color: "#EE6055", // Light Red
        image: "/images/demo/plumbing.png",
        duration: 30, // Fallback duration
        transcript: [
            { speaker: "AI", text: "Thank you for calling Mountain View Plumbing. How may I help you?" },
            { speaker: "Caller", text: "Hi, I just went to take a shower before work and realized I have no hot water." },
            { speaker: "Caller", text: "I think my water heater stopped working." },
            { speaker: "AI", text: "I'm sorry to hear that. I can get a technician out to you today between 2 and 4 PM. Does that work?" },
            { speaker: "Caller", text: "Yes, that would be perfect." },
            { speaker: "AI", text: "Great. I have your address as 123 Maple Street. Is that correct?" },
            { speaker: "Caller", text: "That is correct." }
        ]
    },
    law: {
        label: "Law Firms",
        color: "#295647", // Forest Green
        image: "/images/demo/law.png",
        duration: 25,
        transcript: [
            { speaker: "AI", text: "Good afternoon, Law Offices of Sarah Jenkins. Who am I speaking with?" },
            { speaker: "Caller", text: "Hi, this is Michael. I need to schedule a consultation regarding a contract dispute." },
            { speaker: "AI", text: "I can help with that, Michael. Are you a new or existing client?" },
            { speaker: "Caller", text: "I'm a new client." },
            { speaker: "AI", text: "Understood. The earliest availability for a new client consultation is this Thursday at 10 AM. Shall I book that?" }
        ]
    },
    medical: {
        label: "Medical",
        color: "#4A90E2", // Medical Blue
        image: "/images/demo/medical.png",
        duration: 28,
        transcript: [
            { speaker: "AI", text: "Thank you for calling City Dental. How can I assist you today?" },
            { speaker: "Caller", text: "Hello, I need to reschedule my cleaning appointment for next week." },
            { speaker: "AI", text: "No problem. Could you please provide your full name and date of birth?" },
            { speaker: "Caller", text: "Jane Doe, March 4th, 1985." },
            { speaker: "AI", text: "Thank you, Jane. I see your appointment on Tuesday. When would you like to move it to?" }
        ]
    },
    realestate: {
        label: "Real Estate",
        color: "#F5A623", // Gold/Orange
        image: "/images/demo/realestate.png",
        duration: 32,
        transcript: [
            { speaker: "AI", text: "Luxury Living Real Estate. Are you calling about buying, selling, or renting?" },
            { speaker: "Caller", text: "I'm interested in the property listed on Oakhaven Drive." },
            { speaker: "AI", text: "Excellent choice. That property just hit the market. Would you like to schedule a viewing?" },
            { speaker: "Caller", text: "Yes, I'm free this weekend." },
            { speaker: "AI", text: "We have an open house on Saturday from 11 to 2, or I can book a private showing on Sunday." }
        ]
    }
};

const VoiceDemo = () => {
    const [activeTab, setActiveTab] = useState('plumbing');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLineIndex, setCurrentLineIndex] = useState(-1);
    const [voices, setVoices] = useState([]);

    const transcriptionRef = useRef(null);
    const isPlayingRef = useRef(false);
    const timeoutRef = useRef(null);

    const currentScenario = DEMO_DATA[activeTab];

    // Load browser voices
    useEffect(() => {
        const updateVoices = () => {
            const available = window.speechSynthesis.getVoices();
            console.log("Loaded Voices:", available.map(v => v.name));
            setVoices(available);
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
    }, []);

    const stopEverything = () => {
        window.speechSynthesis.cancel();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        isPlayingRef.current = false;
        setIsPlaying(false);
    };

    // Stop when switching tabs
    useEffect(() => {
        stopEverything();
        setCurrentLineIndex(-1);
    }, [activeTab]);

    // Stop on unmount
    useEffect(() => {
        return () => stopEverything();
    }, []);

    // Voice Selection (Trying to find "Human sounding" voices)
    const getVoice = (speaker) => {
        if (!voices.length) return null;

        // Priorities for AI (Female/Professional) vs Caller (Male/Casual)
        // Adjust based on OS (Mac vs Win)
        // Mac: Samantha, Victoria, Daniel
        // Win: Microsoft Zira, Microsoft David
        // Chrome: Google US English

        let preferred;
        if (speaker === 'AI') {
            preferred = voices.find(v => v.name.includes("Samantha")) ||
                voices.find(v => v.name.includes("Google US English")) ||
                voices.find(v => v.name.includes("Zira")) ||
                voices.find(v => v.name.includes("Female"));
        } else {
            preferred = voices.find(v => v.name.includes("Daniel")) ||
                voices.find(v => v.name.includes("Google UK English Male")) ||
                voices.find(v => v.name.includes("David")) ||
                voices.find(v => v.name.includes("Male"));
        }

        return preferred || voices[0];
    };

    const speakLine = (index) => {
        if (!isPlayingRef.current) return;
        if (index >= currentScenario.transcript.length) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            return;
        }

        // Update UI to show this line
        setCurrentLineIndex(index);

        const line = currentScenario.transcript[index];
        const u = new SpeechSynthesisUtterance(line.text);

        u.voice = getVoice(line.speaker);
        u.rate = 0.95; // Slightly slower is often more realistic
        u.pitch = line.speaker === 'AI' ? 1.05 : 0.95; // Subtle distinction

        u.onend = () => {
            if (!isPlayingRef.current) return;

            // Reduced gap for more natural conversation (0.8s)
            timeoutRef.current = setTimeout(() => {
                speakLine(index + 1);
            }, 800);
        };

        window.speechSynthesis.speak(u);
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopEverything();
        } else {
            setIsPlaying(true);
            isPlayingRef.current = true;
            setCurrentLineIndex(-1); // Reset visuals
            setTimeout(() => speakLine(0), 100); // Slight delay start
        }
    };

    // Auto-scroll
    useEffect(() => {
        if (transcriptionRef.current) {
            transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
        }
    }, [currentLineIndex]);

    // Calculate generic progress based on lines for the bar
    const progressPercent = currentLineIndex === -1 ? 0 :
        Math.min(100, ((currentLineIndex + 1) / currentScenario.transcript.length) * 100);

    return (
        <div style={{
            backgroundColor: '#FAF8F5',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            maxWidth: '450px',
            margin: '0 auto',
            border: '1px solid rgba(0,0,0,0.05)'
        }}>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                flexWrap: 'nowrap', // Force single line
                overflowX: 'auto',   // Scroll if absolutely necessary
                scrollbarWidth: 'none', // Hide scrollbar
                justifyContent: 'space-between', // Distribute evenly
                gap: '5px',
                padding: '15px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                backgroundColor: '#fff'
            }}>
                {Object.entries(DEMO_DATA).map(([key, data]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={{
                            padding: '6px 10px', // Reduced padding to fit
                            borderRadius: '20px',
                            border: key === activeTab ? `2px solid ${data.color}` : '1px solid #ddd',
                            backgroundColor: key === activeTab ? data.color : '#fff',
                            color: key === activeTab ? '#fff' : '#666',
                            fontSize: '0.75rem', // Slightly smaller font
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            flex: '1 0 auto', // Allow flex
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                    >
                        {data.label}
                    </button>
                ))}
            </div>

            {/* Player Header */}
            <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <button
                        onClick={togglePlay}
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: currentScenario.color,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        {isPlaying ? '■' : '▶'}
                    </button>

                    <div style={{ flex: 1 }}>
                        <div style={{ height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                backgroundColor: currentScenario.color,
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888' }}>
                            <span>{isPlaying ? 'Playing...' : 'Reference Demo'}</span>
                            <span>Audio</span>
                        </div>
                    </div>

                    <button
                        onClick={stopEverything}
                        style={{ border: 'none', background: 'transparent', color: '#aaa', fontSize: '1.2rem', cursor: 'pointer' }}
                    >
                        ⟳
                    </button>
                </div>

                {/* Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: currentScenario.color,
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                    }}>
                        <span style={{ fontSize: '1rem' }}>✨</span> AI Agent
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#555',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        padding: '6px 12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px'
                    }}>
                        📞 Caller
                    </div>
                </div>
            </div>

            {/* Transcript/Image Window */}
            <div ref={transcriptionRef} style={{
                height: '350px', // Slightly taller for better image view
                overflowY: isPlaying ? 'auto' : 'hidden', // Disable scroll when just image
                padding: '20px',
                backgroundColor: '#FAF8F5',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                scrollBehavior: 'smooth',
                position: 'relative',
                backgroundImage: `url(${currentScenario.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.5s ease',
                cursor: !isPlaying ? 'pointer' : 'default'
            }} onClick={!isPlaying ? togglePlay : undefined}>

                {/* Dynamic Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    // If playing, strong white overlay for text readability.
                    // If not playing, very subtle dark overlay for play button contrast.
                    backgroundColor: isPlaying ? 'rgba(255, 255, 255, 0.90)' : 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: isPlaying ? 'blur(5px)' : 'none',
                    zIndex: 0,
                    transition: 'all 0.5s ease'
                }}></div>

                {/* Content Container */}
                <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>

                    {/* Centered Play Button (Visible when NOT playing) */}
                    {!isPlaying && (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'fadeIn 0.5s ease'
                        }}>
                            {/* Just the triangle, no circle */}
                            <div style={{
                                width: '0',
                                height: '0',
                                borderTop: '30px solid transparent',
                                borderBottom: '30px solid transparent',
                                borderLeft: '50px solid rgba(255,255,255,0.95)',
                                marginLeft: '8px',
                                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}></div>
                        </div>
                    )}

                    {/* Transcript (Visible when playing) */}
                    {isPlaying && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px' }}>
                            {currentScenario.transcript.map((line, index) => {
                                // Strictly show progress
                                if (index > currentLineIndex) return null;

                                return (
                                    <div key={index} style={{
                                        alignSelf: line.speaker === 'AI' ? 'flex-start' : 'flex-end',
                                        maxWidth: '85%',
                                        animation: 'slideUp 0.4s ease-out',
                                    }}>
                                        <style>{`
                            @keyframes slideUp {
                              from { opacity: 0; transform: translateY(15px); }
                              to { opacity: 1; transform: translateY(0); }
                            }
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                          `}</style>
                                        <div style={{
                                            backgroundColor: line.speaker === 'AI' ? currentScenario.color : '#fff',
                                            color: line.speaker === 'AI' ? '#fff' : '#333',
                                            padding: '12px 16px',
                                            borderRadius: line.speaker === 'AI' ? '12px 12px 12px 0' : '12px 12px 0 12px',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.5',
                                            border: line.speaker === 'Caller' ? '1px solid #eee' : 'none',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                        }}>
                                            {line.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceDemo;
