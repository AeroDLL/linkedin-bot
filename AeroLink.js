// ==UserScript==
// @name         🚀 LinkedIn AI Pro v2.0
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Advanced LinkedIn AI Assistant with enhanced features
// @author       AeroDLL Team
// @match        https://www.linkedin.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      generativelanguage.googleapis.com
// @connect      api.linkedin.com
// @noframes
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return;

    // Configuration
    const CONFIG = {
        DEFAULT_API_KEY: '',
        SAFE_MODE: true,
        MAX_CONNECTIONS_PER_HOUR: 50,
        DELAY_BETWEEN_ACTIONS: 15000,
        LANGUAGE: 'auto'
    };

    let boosterInterval = null;
    let analyticsData = {
        connections: 0,
        messages: 0,
        posts: 0,
        lastReset: Date.now()
    };

    // Multi-language support
    const LANGUAGES = {
        tr: {
            dashboard: 'AI Studio Pro',
            post_writer: '✍️ Post Yaz',
            style_trainer: '🧠 Stil Öğret',
            network_booster: '🚀 Network Artır',
            comment_ai: '💬 Yorum AI',
            message_ai: '✉️ Mesaj AI',
            profile_analyzer: '📊 Profil Analiz',
            content_discovery: '🔍 İçerik Keşif',
            analytics: '📈 Analitik',
            settings: '⚙️ Ayarlar',
            close: '✕',
            generate: '✨ Üret',
            save_style: '💾 Stili Kaydet',
            start: '▶️ Başlat',
            stop: '⏹️ Durdur',
            suggest: '💬 Öner',
            send_message: '✉️ Mesaj Gönder',
            analyze: '📊 Analiz Et',
            discover: '🔍 Keşfet',
            save_settings: '💾 Ayarları Kaydet',
            api_key: 'Gemini API Key',
            role: 'Meslek/Rol',
            industry: 'Sektör',
            location: 'Lokasyon',
            connection_limit: 'Bağlantı Limiti',
            safe_mode: 'Güvenli Mod',
            boost_log: '🚀 Network Booster (Güvenli Mod)',
            ready: 'Hazır...',
            booster_started: '🚀 Booster başlatıldı...',
            person_found: '👤 Kişi bulundu, bağlantı isteği gönderiliyor...',
            window_check: '⏳ Pencere kontrol ediliyor...',
            security_risk: '⚠️ Güvenlik: Geri alma riski önleniyor.',
            request_sent: '✅ Bağlantı isteği gönderildi!',
            continuing: 'ℹ️ Devam ediliyor...',
            searching: '🔍 Bağlantı aranıyor...',
            settings_saved: '✅ Ayarlar Kaydedildi!',
            style_saved: '✅ Stil Kaydedildi!',
            enter_api_key: '⚠️ Lütfen Ayarlar menüsünden API Key giriniz!',
            error: '❌ Hata',
            api_key_check: 'API Key\'inizi kontrol edin.',
            parsing_error: 'Yanıt işlenirken hata oluştu.',
            connection_error: 'Bağlantı Hatası.',
            post_topic: 'Konu girin...',
            comment_post: 'Postu yapıştırın...',
            message_content: 'Mesaj içeriğini girin...',
            profile_url: 'Profil URL\'sini yapıştırın...',
            content_topic: 'İçerik konusunu girin...',
            analyzing: '🔍 Profil analiz ediliyor...',
            discovery_in_progress: '🔍 Trend içerikler aranıyor...',
            analytics_title: '📈 Performans Analizi',
            connections_made: 'Kurulan Bağlantılar',
            messages_sent: 'Gönderilen Mesajlar',
            posts_created: 'Oluşturulan Postlar',
            growth_rate: 'Büyüme Oranı',
            weekly_growth: 'Haftalık Büyüme',
            monthly_growth: 'Aylık Büyüme',
            best_time: 'En İyi Yayın Zamanı',
            trending_topics: 'Trend Konular',
            suggested_hashtags: 'Önerilen Hashtagler'
        },
        en: {
            dashboard: 'AI Studio Pro',
            post_writer: '✍️ Post Writer',
            style_trainer: '🧠 Style Trainer',
            network_booster: '🚀 Network Booster',
            comment_ai: '💬 Comment AI',
            message_ai: '✉️ Message AI',
            profile_analyzer: '📊 Profile Analyzer',
            content_discovery: '🔍 Content Discovery',
            analytics: '📈 Analytics',
            settings: '⚙️ Settings',
            close: '✕',
            generate: '✨ Generate',
            save_style: '💾 Save Style',
            start: '▶️ Start',
            stop: '⏹️ Stop',
            suggest: '💬 Suggest',
            send_message: '✉️ Send Message',
            analyze: '📊 Analyze',
            discover: '🔍 Discover',
            save_settings: '💾 Save Settings',
            api_key: 'Gemini API Key',
            role: 'Role/Position',
            industry: 'Industry',
            location: 'Location',
            connection_limit: 'Connection Limit',
            safe_mode: 'Safe Mode',
            boost_log: '🚀 Network Booster (Safe Mode)',
            ready: 'Ready...',
            booster_started: '🚀 Booster started...',
            person_found: '👤 Person found, sending connection request...',
            window_check: '⏳ Checking window...',
            security_risk: '⚠️ Security: Withdraw risk avoided.',
            request_sent: '✅ Connection request sent!',
            continuing: 'ℹ️ Continuing...',
            searching: '🔍 Searching for connections...',
            settings_saved: '✅ Settings Saved!',
            style_saved: '✅ Style Saved!',
            enter_api_key: '⚠️ Please enter API Key in Settings!',
            error: '❌ Error',
            api_key_check: 'Please check your API Key.',
            parsing_error: 'Error parsing response.',
            connection_error: 'Connection Error.',
            post_topic: 'Enter topic...',
            comment_post: 'Paste the post...',
            message_content: 'Enter message content...',
            profile_url: 'Paste profile URL...',
            content_topic: 'Enter content topic...',
            analyzing: '🔍 Analyzing profile...',
            discovery_in_progress: '🔍 Searching for trending content...',
            analytics_title: '📈 Performance Analytics',
            connections_made: 'Connections Made',
            messages_sent: 'Messages Sent',
            posts_created: 'Posts Created',
            growth_rate: 'Growth Rate',
            weekly_growth: 'Weekly Growth',
            monthly_growth: 'Monthly Growth',
            best_time: 'Best Time to Post',
            trending_topics: 'Trending Topics',
            suggested_hashtags: 'Suggested Hashtags'
        }
    };

    window.addEventListener('load', () => setTimeout(init, 1500));

    setInterval(() => {
        if (!document.getElementById('linkedin-ai-pro-root')) init();
    }, 3000);

    function init() {
        const old = document.getElementById('linkedin-ai-pro-root');
        if (old) old.remove();

        const host = document.createElement('div');
        host.id = 'linkedin-ai-pro-root';
        host.style.cssText = `position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;`;
        document.documentElement.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });

        // Enhanced UI with modern design
        shadow.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                :host {
                    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }

                #openBtn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 65px;
                    height: 65px;
                    background: linear-gradient(135deg, #0077b5, #005885);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #fff;
                    font-size: 28px;
                    border: 3px solid #fff;
                    box-shadow: 0 6px 25px rgba(0, 119, 181, 0.4);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: auto;
                    z-index: 2147483648;
                    backdrop-filter: blur(10px);
                }

                #openBtn:hover {
                    transform: scale(1.1) rotate(10deg);
                    box-shadow: 0 8px 30px rgba(0, 119, 181, 0.6);
                }

                #modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    pointer-events: auto;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                #modal.active {
                    display: flex;
                    opacity: 1;
                }

                .dashboard {
                    width: 1000px;
                    height: 750px;
                    max-width: 95vw;
                    max-height: 90vh;
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                    border-radius: 20px;
                    overflow: hidden;
                    display: flex;
                    border: 1px solid #e1e5e9;
                    position: relative;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                    backdrop-filter: blur(10px);
                }

                .sidebar {
                    width: 260px;
                    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
                    border-right: 1px solid #e1e5e9;
                    display: flex;
                    flex-direction: column;
                    padding: 25px 0;
                    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
                }

                .brand {
                    padding: 0 25px 25px;
                    font-size: 20px;
                    font-weight: 800;
                    border-bottom: 1px solid #e1e5e9;
                    color: #0077b5;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .menu-item {
                    padding: 15px 25px;
                    font-size: 14px;
                    color: #5f6368;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    border-left: 3px solid transparent;
                }

                .menu-item:hover {
                    background: #f0f7ff;
                    color: #0077b5;
                    border-left: 3px solid #0077b5;
                }

                .menu-item.active {
                    background: #e8f4fe;
                    color: #0077b5;
                    font-weight: 700;
                    border-left: 3px solid #0077b5;
                }

                .menu-item span.en {
                    font-size: 11px;
                    opacity: 0.7;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .main-content {
                    flex: 1;
                    padding: 35px;
                    overflow-y: auto;
                    background: #ffffff;
                    position: relative;
                }

                .view {
                    display: none;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .view.active {
                    display: block;
                }

                .view-header {
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e1e5e9;
                }

                .view-header h2 {
                    color: #1c1f23;
                    font-size: 24px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                textarea, input {
                    width: 100%;
                    padding: 14px;
                    background: #f9fafb;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    font-size: 15px;
                    margin-bottom: 20px;
                    outline: none;
                    transition: all 0.2s ease;
                    font-family: inherit;
                }

                textarea:focus, input:focus {
                    border-color: #0077b5;
                    box-shadow: 0 0 0 3px rgba(0, 119, 181, 0.1);
                    background: #ffffff;
                }

                .btn {
                    background: linear-gradient(135deg, #0077b5, #005885);
                    color: #fff;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 2px 10px rgba(0, 119, 181, 0.2);
                }

                .btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 119, 181, 0.3);
                    background: linear-gradient(135deg, #005885, #003d5c);
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-stop {
                    background: linear-gradient(135deg, #dc3545, #a71d2a);
                    box-shadow: 0 2px 10px rgba(220, 53, 69, 0.2);
                }

                .btn-stop:hover:not(:disabled) {
                    background: linear-gradient(135deg, #a71d2a, #8b1923);
                    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
                }

                .btn-secondary {
                    background: linear-gradient(135deg, #6c757d, #545b62);
                    box-shadow: 0 2px 10px rgba(108, 117, 125, 0.2);
                }

                .btn-secondary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #545b62, #495057);
                    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
                }

                .result-box {
                    background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
                    border: 1px solid #bae6fd;
                    border-radius: 12px;
                    padding: 25px;
                    margin-top: 25px;
                    white-space: pre-wrap;
                    display: none;
                    line-height: 1.7;
                    font-size: 15px;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .close-btn {
                    position: absolute;
                    top: 25px;
                    right: 25px;
                    font-size: 26px;
                    cursor: pointer;
                    color: #9ca3af;
                    border: none;
                    background: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .close-btn:hover {
                    background: #f3f4f6;
                    color: #374151;
                }

                #boost-log {
                    background: #1e1e1e;
                    color: #00ff00;
                    font-family: 'Courier New', monospace;
                    padding: 20px;
                    border-radius: 12px;
                    height: 250px;
                    overflow-y: auto;
                    margin-top: 20px;
                    font-size: 12px;
                    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
                    border: 1px solid #374151;
                }

                .error-msg {
                    color: #dc3545;
                    font-size: 13px;
                    margin-top: 10px;
                    display: none;
                    background: #fff5f5;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #fed7d7;
                    line-height: 1.5;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    border: 1px solid #e1e5e9;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0077b5;
                    margin-bottom: 5px;
                }

                .stat-label {
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 500;
                }

                .chart-container {
                    background: #ffffff;
                    border: 1px solid #e1e5e9;
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .chart-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1c1f23;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .tag-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 15px;
                }

                .tag {
                    background: linear-gradient(135deg, #0077b5 0%, #005885 100%);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #374151;
                    font-size: 14px;
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 24px;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }

                input:checked + .slider {
                    background-color: #0077b5;
                }

                input:checked + .slider:before {
                    transform: translateX(26px);
                }

                .settings-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 15px 0;
                    border-bottom: 1px solid #e1e5e9;
                }

                .settings-row:last-child {
                    border-bottom: none;
                }

                .settings-label {
                    font-weight: 500;
                    color: #374151;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 15px 0;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #0077b5, #005885);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #0077b5;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999999;
                    transform: translateX(120%);
                    transition: transform 0.3s ease;
                }

                .notification.show {
                    transform: translateX(0);
                }
            </style>

            <div id="openBtn">🚀</div>

            <div id="modal">
                <div class="dashboard">
                    <div class="sidebar">
                        <div class="brand">🚀 AI Studio Pro</div>
                        <div class="menu-item active" data-view="post">
                            <span>✍️ Post Yaz</span><span class="en">Post Writer</span>
                        </div>
                        <div class="menu-item" data-view="train">
                            <span>🧠 Stil Öğret</span><span class="en">Style Trainer</span>
                        </div>
                        <div class="menu-item" data-view="boost">
                            <span>🚀 Network Artır</span><span class="en">Network Booster</span>
                        </div>
                        <div class="menu-item" data-view="comment">
                            <span>💬 Yorum AI</span><span class="en">Comment AI</span>
                        </div>
                        <div class="menu-item" data-view="message">
                            <span>✉️ Mesaj AI</span><span class="en">Message AI</span>
                        </div>
                        <div class="menu-item" data-view="profile">
                            <span>📊 Profil Analiz</span><span class="en">Profile Analyzer</span>
                        </div>
                        <div class="menu-item" data-view="discovery">
                            <span>🔍 İçerik Keşif</span><span class="en">Content Discovery</span>
                        </div>
                        <div class="menu-item" data-view="analytics">
                            <span>📈 Analitik</span><span class="en">Analytics</span>
                        </div>
                        <div class="menu-item" data-view="settings" style="margin-top:auto">
                            <span>⚙️ Ayarlar</span><span class="en">Settings</span>
                        </div>
                    </div>

                    <div class="main-content">
                        <button class="close-btn" id="closeBtn">✕</button>

                        <!-- Post Writer View -->
                        <div id="view-post" class="view active">
                            <div class="view-header">
                                <h2>✍️ Post Yaz / Post Writer</h2>
                            </div>
                            <textarea id="in-post" placeholder="Konu girin... / Enter topic..." rows="4"></textarea>
                            <button class="btn" id="btn-post">✨ Üret / Generate</button>
                            <div id="out-post" class="result-box"></div>
                            <div id="err-post" class="error-msg"></div>
                        </div>

                        <!-- Style Trainer View -->
                        <div id="view-train" class="view">
                            <div class="view-header">
                                <h2>🧠 Stil Öğret / Train Style</h2>
                            </div>
                            <p style="font-size:13px; color:#666; margin-bottom:15px;">Yapay zeka bu stile göre yazar. / AI writes based on this style.</p>
                            <textarea id="in-train" style="height:300px" placeholder="Örn: Teknik ve samimi bir dil kullan... / e.g.: Use technical and friendly language..."></textarea>
                            <button class="btn" id="btn-train">💾 Kaydet / Save Style</button>
                        </div>

                        <!-- Network Booster View -->
                        <div id="view-boost" class="view">
                            <div class="view-header">
                                <h2>🚀 Network Booster (Güvenli Mod)</h2>
                            </div>
                            <p style="color:#666;font-size:14px;margin-bottom:20px;">Güvenli mod aktif. / Safe mode active.</p>

                            <div class="form-group">
                                <label class="form-label">Bağlantı Limiti / Connection Limit</label>
                                <input type="number" id="connection-limit" value="50" min="10" max="200" placeholder="50">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Güvenli Mod / Safe Mode</label>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="safe-mode" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>

                            <button class="btn" id="btn-boost-start">▶️ Başlat / Start</button>
                            <button class="btn btn-stop" id="btn-boost-stop" style="display:none">⏹️ Durdur / Stop</button>
                            <div id="boost-log">Hazır... / Ready...</div>
                        </div>

                        <!-- Comment AI View -->
                        <div id="view-comment" class="view">
                            <div class="view-header">
                                <h2>💬 Yorum / Comment AI</h2>
                            </div>
                            <textarea id="in-com" placeholder="Postu yapıştırın... / Paste the post..." rows="4"></textarea>
                            <button class="btn" id="btn-com">💬 Öner / Suggest</button>
                            <div id="out-com" class="result-box"></div>
                            <div id="err-com" class="error-msg"></div>
                        </div>

                        <!-- Message AI View -->
                        <div id="view-message" class="view">
                            <div class="view-header">
                                <h2>✉️ Mesaj AI / Message AI</h2>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Profil URL / Profile URL</label>
                                <input type="text" id="message-profile" placeholder="https://linkedin.com/in/...">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Mesaj İçeriği / Message Content</label>
                                <textarea id="message-content" placeholder="Mesaj içeriğini girin... / Enter message content..." rows="4"></textarea>
                            </div>
                            <button class="btn" id="btn-message">✉️ Mesaj Gönder / Send Message</button>
                            <div id="out-message" class="result-box"></div>
                            <div id="err-message" class="error-msg"></div>
                        </div>

                        <!-- Profile Analyzer View -->
                        <div id="view-profile" class="view">
                            <div class="view-header">
                                <h2>📊 Profil Analiz / Profile Analyzer</h2>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Profil URL / Profile URL</label>
                                <input type="text" id="profile-url" placeholder="https://linkedin.com/in/...">
                            </div>
                            <button class="btn" id="btn-profile">📊 Analiz Et / Analyze</button>
                            <div id="out-profile" class="result-box"></div>
                            <div id="err-profile" class="error-msg"></div>
                        </div>

                        <!-- Content Discovery View -->
                        <div id="view-discovery" class="view">
                            <div class="view-header">
                                <h2>🔍 İçerik Keşif / Content Discovery</h2>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Konu / Topic</label>
                                <input type="text" id="discovery-topic" placeholder="İçerik konusunu girin... / Enter content topic...">
                            </div>
                            <button class="btn" id="btn-discovery">🔍 Keşfet / Discover</button>
                            <div id="out-discovery" class="result-box"></div>
                            <div id="err-discovery" class="error-msg"></div>
                        </div>

                        <!-- Analytics View -->
                        <div id="view-analytics" class="view">
                            <div class="view-header">
                                <h2>📈 Performans Analizi / Performance Analytics</h2>
                            </div>

                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value" id="connections-count">0</div>
                                    <div class="stat-label">Kurulan Bağlantılar<br>Connections Made</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value" id="messages-count">0</div>
                                    <div class="stat-label">Gönderilen Mesajlar<br>Messages Sent</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value" id="posts-count">0</div>
                                    <div class="stat-label">Oluşturulan Postlar<br>Posts Created</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value" id="growth-rate">0%</div>
                                    <div class="stat-label">Büyüme Oranı<br>Growth Rate</div>
                                </div>
                            </div>

                            <div class="chart-container">
                                <div class="chart-title">📈 Haftalık Büyüme / Weekly Growth</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" id="growth-progress" style="width: 0%"></div>
                                </div>
                            </div>

                            <div class="chart-container">
                                <div class="chart-title">🔍 Trend Konular / Trending Topics</div>
                                <div class="tag-list" id="trending-topics">
                                    <span class="tag">#AI</span>
                                    <span class="tag">#Technology</span>
                                    <span class="tag">#Innovation</span>
                                    <span class="tag">#Leadership</span>
                                </div>
                            </div>

                            <div class="chart-container">
                                <div class="chart-title">🏷️ Önerilen Hashtagler / Suggested Hashtags</div>
                                <div class="tag-list" id="suggested-hashtags">
                                    <span class="tag">#LinkedIn</span>
                                    <span class="tag">#Networking</span>
                                    <span class="tag">#Career</span>
                                    <span class="tag">#Professional</span>
                                </div>
                            </div>
                        </div>

                        <!-- Settings View -->
                        <div id="view-settings" class="view">
                            <div class="view-header">
                                <h2>⚙️ Ayarlar / Settings</h2>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Gemini API Key</label>
                                <input id="in-apikey" type="password" placeholder="AIzaSy...">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Meslek / Role</label>
                                <input id="in-role" placeholder="Örn: Yazılım Geliştirici / e.g.: Software Developer">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Sektör / Industry</label>
                                <input id="in-industry" placeholder="Örn: Teknoloji / e.g.: Technology">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Lokasyon / Location</label>
                                <input id="in-location" placeholder="Örn: İstanbul / e.g.: Istanbul">
                            </div>

                            <div class="settings-row">
                                <span class="settings-label">Güvenli Mod / Safe Mode</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="setting-safe-mode" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>

                            <div class="settings-row">
                                <span class="settings-label">Bildirimler / Notifications</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="setting-notifications" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>

                            <button class="btn" id="btn-save-settings" style="margin-top:20px;">💾 Ayarları Kaydet / Save Settings</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupLogic(shadow);
    }

    function setupLogic(shadow) {
        const modal = shadow.getElementById('modal');
        const openBtn = shadow.getElementById('openBtn');
        const closeBtn = shadow.getElementById('closeBtn');

        // Language detection
        const userLang = navigator.language || navigator.userLanguage;
        const lang = userLang.toLowerCase().includes('tr') ? 'tr' : 'en';

        openBtn.onclick = () => {
            modal.classList.add('active');
            openBtn.style.display = 'none';
        };
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            openBtn.style.display = 'flex';
        };

        const menu = shadow.querySelectorAll('.menu-item');
        const views = shadow.querySelectorAll('.view');

        menu.forEach(item => {
            item.onclick = () => {
                menu.forEach(m => m.classList.remove('active'));
                item.classList.add('active');
                views.forEach(v => v.classList.remove('active'));
                shadow.getElementById('view-' + item.dataset.view).classList.add('active');

                // Analytics view için veri güncelleme
                if (item.dataset.view === 'analytics') {
                    updateAnalytics(shadow);
                }
            };
        });

        // Load saved settings
        const savedKey = GM_getValue('linkedin_apikey', '');
        const savedRole = GM_getValue('linkedin_role', '');
        const savedIndustry = GM_getValue('linkedin_industry', '');
        const savedLocation = GM_getValue('linkedin_location', '');
        const savedStyle = GM_getValue('linkedin_style', '');
        const savedSafeMode = GM_getValue('linkedin_safe_mode', true);
        const savedNotifications = GM_getValue('linkedin_notifications', true);

        if(savedKey) shadow.getElementById('in-apikey').value = savedKey;
        if(savedRole) shadow.getElementById('in-role').value = savedRole;
        if(savedIndustry) shadow.getElementById('in-industry').value = savedIndustry;
        if(savedLocation) shadow.getElementById('in-location').value = savedLocation;
        if(savedStyle) shadow.getElementById('in-train').value = savedStyle;
        shadow.getElementById('setting-safe-mode').checked = savedSafeMode;
        shadow.getElementById('setting-notifications').checked = savedNotifications;

        // Settings save
        shadow.getElementById('btn-save-settings').onclick = () => {
            const k = shadow.getElementById('in-apikey').value.trim();
            const r = shadow.getElementById('in-role').value.trim();
            const i = shadow.getElementById('in-industry').value.trim();
            const l = shadow.getElementById('in-location').value.trim();
            const sm = shadow.getElementById('setting-safe-mode').checked;
            const n = shadow.getElementById('setting-notifications').checked;

            GM_setValue('linkedin_apikey', k);
            GM_setValue('linkedin_role', r);
            GM_setValue('linkedin_industry', i);
            GM_setValue('linkedin_location', l);
            GM_setValue('linkedin_safe_mode', sm);
            GM_setValue('linkedin_notifications', n);

            showNotification(shadow, lang === 'tr' ? '✅ Ayarlar Kaydedildi!' : '✅ Settings Saved!');
        };

        // Style save
        shadow.getElementById('btn-train').onclick = () => {
            GM_setValue('linkedin_style', shadow.getElementById('in-train').value);
            showNotification(shadow, lang === 'tr' ? '✅ Stil Kaydedildi!' : '✅ Style Saved!');
        };

        // Network Booster
        const bStart = shadow.getElementById('btn-boost-start');
        const bStop = shadow.getElementById('btn-boost-stop');
        const bLog = shadow.getElementById('boost-log');
        const addLog = (txt) => {
            bLog.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${txt}</div>`;
            bLog.scrollTop = bLog.scrollHeight;
        };

        bStart.onclick = () => {
            bStart.style.display = 'none';
            bStop.style.display = 'inline-block';
            addLog(lang === 'tr' ? "🚀 Booster başlatıldı..." : "🚀 Booster started...");

            boosterInterval = setInterval(() => {
                const buttons = Array.from(document.querySelectorAll('button')).filter(b =>
                    (b.innerText.trim() === 'Bağlantı kur' || b.innerText.trim() === 'Connect') &&
                    !b.closest('.artdeco-modal')
                );

                if (buttons.length > 0) {
                    addLog(lang === 'tr' ? "👤 Kişi bulundu, bağlantı isteği gönderiliyor..." : "👤 Person found, sending connection request...");
                    const target = buttons[0];
                    target.scrollIntoView({behavior: "smooth", block: "center"});
                    target.click();

                    setTimeout(() => {
                        addLog(lang === 'tr' ? "⏳ Pencere kontrol ediliyor..." : "⏳ Checking window...");
                        const modals = document.querySelectorAll('.artdeco-modal');
                        let handled = false;

                        modals.forEach(m => {
                            if (m.innerText.toLowerCase().includes("geri alın") || m.innerText.toLowerCase().includes("withdraw")) {
                                const x = m.querySelector('button[aria-label="Dismiss"], .artdeco-modal__dismiss');
                                if (x) x.click();
                                addLog(lang === 'tr' ? "⚠️ Güvenlik: Geri alma riski önleniyor." : "⚠️ Security: Withdraw risk avoided.");
                                handled = true;
                            } else {
                                const send = Array.from(m.querySelectorAll('button')).find(b =>
                                    b.innerText.includes("gönder") || b.innerText.includes("Send now")
                                );
                                if (send) {
                                    send.click();
                                    addLog(lang === 'tr' ? "✅ Bağlantı isteği gönderildi!" : "✅ Connection request sent!");
                                    analyticsData.connections++;
                                    handled = true;
                                }
                            }
                        });
                        if (!handled) addLog(lang === 'tr' ? "ℹ️ Devam ediliyor..." : "ℹ️ Continuing...");
                    }, 2000);
                } else {
                    addLog(lang === 'tr' ? "🔍 Bağlantı aranıyor..." : "🔍 Searching for connections...");
                }
            }, CONFIG.DELAY_BETWEEN_ACTIONS + Math.random() * 5000);
        };

        bStop.onclick = () => {
            clearInterval(boosterInterval);
            bStart.style.display = 'inline-block';
            bStop.style.display = 'none';
            addLog(lang === 'tr' ? "🛑 Durduruldu." : "🛑 Stopped.");
        };

        // AI Functions
        const runAI = (prompt, outId, btnId, errId) => {
            const btn = shadow.getElementById(btnId);
            const out = shadow.getElementById(outId);
            const err = shadow.getElementById(errId);
            const old = btn.innerText;

            const realKey = GM_getValue('linkedin_apikey', CONFIG.DEFAULT_API_KEY);

            if (!realKey) {
                alert(lang === 'tr' ? "⚠️ Lütfen 'Ayarlar' menüsünden API Key giriniz!" : "⚠️ Please enter API Key in Settings!");
                return;
            }

            btn.innerText = "..."; btn.disabled = true;
            out.style.display = 'none'; err.style.display = 'none';

            const r = GM_getValue('linkedin_role') || "Professional";
            const s = GM_getValue('linkedin_style') || "";
            const fP = `Role: ${r}. Style: ${s}. Task: ${prompt}. Respond in the language of the task.`;

            GM_xmlhttpRequest({
                method: "POST",
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${realKey}`,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ contents: [{ parts: [{ text: fP }] }] }),
                onload: (res) => {
                    btn.innerText = old; btn.disabled = false;
                    if (res.status !== 200) {
                        err.innerHTML = `<b>${lang === 'tr' ? '❌ Hata' : '❌ Error'}: ${res.status}</b><br>${
                            lang === 'tr' ? 'API Key\'inizi kontrol edin.' : 'Please check your API Key.'
                        }<br>${res.statusText}`;
                        err.style.display = 'block';
                        return;
                    }
                    try {
                        const d = JSON.parse(res.responseText);
                        out.innerText = d.candidates[0].content.parts[0].text;
                        out.style.display = 'block';
                        analyticsData.posts++;
                    } catch (e) {
                        err.innerText = lang === 'tr' ? "Yanıt işlenirken hata oluştu." : "Error parsing response.";
                        err.style.display = 'block';
                    }
                },
                onerror: (e) => {
                    btn.innerText = old; btn.disabled = false;
                    err.innerText = lang === 'tr' ? "Bağlantı Hatası." : "Connection Error.";
                    err.style.display = 'block';
                }
            });
        };

        // Button event handlers
        shadow.getElementById('btn-post').onclick = () => runAI(shadow.getElementById('in-post').value, 'out-post', 'btn-post', 'err-post');
        shadow.getElementById('btn-com').onclick = () => runAI(shadow.getElementById('in-com').value, 'out-com', 'btn-com', 'err-com');
        shadow.getElementById('btn-message').onclick = () => runAI(`${shadow.getElementById('message-content').value} - Profil: ${shadow.getElementById('message-profile').value}`, 'out-message', 'btn-message', 'err-message');
        shadow.getElementById('btn-profile').onclick = () => runAI(`Profil analizi yap: ${shadow.getElementById('profile-url').value}`, 'out-profile', 'btn-profile', 'err-profile');
        shadow.getElementById('btn-discovery').onclick = () => runAI(`İçerik keşfi: ${shadow.getElementById('discovery-topic').value}`, 'out-discovery', 'btn-discovery', 'err-discovery');
    }

    function updateAnalytics(shadow) {
        shadow.getElementById('connections-count').textContent = analyticsData.connections;
        shadow.getElementById('messages-count').textContent = analyticsData.messages;
        shadow.getElementById('posts-count').textContent = analyticsData.posts;

        const growthRate = Math.min(100, analyticsData.connections * 2);
        shadow.getElementById('growth-rate').textContent = `${growthRate}%`;
        shadow.getElementById('growth-progress').style.width = `${growthRate}%`;
    }

    function showNotification(shadow, message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        shadow.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
})();
