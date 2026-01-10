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
        MAX_CONNECTIONS_PER_DAY: 100,
        MAX_ACTIONS_PER_HOUR: 80,
        MAX_ACTIONS_PER_DAY: 200,
        DELAY_BETWEEN_ACTIONS: 15000,
        MIN_DELAY: 10000,
        MAX_DELAY: 30000,
        COOLDOWN_AFTER_ACTIONS: 10,
        COOLDOWN_DURATION: 180000,
        LANGUAGE: 'auto'
    };

    let boosterInterval = null;
    let actionCount = 0;
    let lastActionTime = 0;
    let sessionStartTime = Date.now();
    let analyticsData = {
        connections: 0,
        messages: 0,
        posts: 0,
        lastReset: Date.now(),
        timeTracking: [],
        dailyActions: {},
        hourlyEngagement: {}
    };

    // Load saved analytics data
    const loadAnalyticsData = () => {
        const saved = GM_getValue('analytics_data', null);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                analyticsData = { ...analyticsData, ...parsed };
            } catch (e) {
                console.log('Failed to load analytics data');
            }
        }
    };

    // Save analytics data
    const saveAnalyticsData = () => {
        try {
            GM_setValue('analytics_data', JSON.stringify(analyticsData));
        } catch (e) {
            console.log('Failed to save analytics data');
        }
    };

    // Track activity time
    const trackActivityTime = (action) => {
        const now = new Date();
        const hour = now.getHours();
        const dayKey = now.toISOString().split('T')[0];

        // Track hourly engagement
        if (!analyticsData.hourlyEngagement[hour]) {
            analyticsData.hourlyEngagement[hour] = 0;
        }
        analyticsData.hourlyEngagement[hour]++;

        // Track daily actions
        if (!analyticsData.dailyActions[dayKey]) {
            analyticsData.dailyActions[dayKey] = 0;
        }
        analyticsData.dailyActions[dayKey]++;

        // Add to time tracking log
        analyticsData.timeTracking.push({
            action: action,
            timestamp: now.getTime(),
            hour: hour,
            day: dayKey
        });

        // Keep only last 500 entries
        if (analyticsData.timeTracking.length > 500) {
            analyticsData.timeTracking = analyticsData.timeTracking.slice(-500);
        }

        saveAnalyticsData();
    };

    // Hashtag database by industry
    const HASHTAG_DATABASE = {
        technology: ['#Technology', '#Innovation', '#AI', '#MachineLearning', '#CloudComputing', '#CyberSecurity', '#DevOps', '#Programming', '#SoftwareDevelopment', '#TechTrends'],
        business: ['#Business', '#Entrepreneurship', '#Leadership', '#Management', '#Strategy', '#Growth', '#Marketing', '#Sales', '#Startup', '#Success'],
        finance: ['#Finance', '#Investment', '#Trading', '#FinTech', '#Banking', '#Economics', '#Cryptocurrency', '#Blockchain', '#WealthManagement', '#FinancialPlanning'],
        healthcare: ['#Healthcare', '#Medicine', '#Health', '#Wellness', '#Telemedicine', '#HealthTech', '#MedicalInnovation', '#PublicHealth', '#Pharma', '#HealthcareIT'],
        education: ['#Education', '#Learning', '#OnlineLearning', '#EdTech', '#Teaching', '#Training', '#ProfessionalDevelopment', '#eLearning', '#HigherEducation', '#Skills'],
        marketing: ['#Marketing', '#DigitalMarketing', '#ContentMarketing', '#SocialMedia', '#SEO', '#Branding', '#Advertising', '#MarketingStrategy', '#GrowthHacking', '#CustomerExperience'],
        general: ['#LinkedIn', '#Professional', '#Career', '#Networking', '#JobSearch', '#WorkLife', '#Productivity', '#Motivation', '#Success', '#Leadership']
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
            suggested_hashtags: 'Önerilen Hashtagler',
            generate_hashtags: '🏷️ Hashtag Üret',
            hashtag_suggestions: 'Hashtag Önerileri',
            click_to_add: 'Eklemek için tıklayın',
            analyzing_content: 'İçerik analiz ediliyor...',
            hashtags_generated: 'Hashtagler oluşturuldu!',
            best_posting_times: 'En İyi Paylaşım Saatleri',
            hourly_activity: 'Saatlik Aktivite',
            peak_hours: 'Yoğun Saatler',
            recommended_time: 'Önerilen Zaman',
            your_timezone: 'Saat Diliminiz',
            export_data: 'Verileri Dışa Aktar',
            export_csv: 'CSV Olarak İndir',
            export_json: 'JSON Olarak İndir',
            engagement_rate: 'Etkileşim Oranı',
            total_actions: 'Toplam Aksiyon',
            daily_limit: 'Günlük Limit',
            hourly_limit: 'Saatlik Limit',
            safety_warning: 'Güvenlik Uyarısı',
            approaching_limit: 'Limite yaklaşıyorsunuz!',
            cooldown_active: 'Bekleme modu aktif',
            actions_today: 'Bugün yapılan aksiyon',
            competitor_analysis: 'Rakip Analizi',
            add_competitor: 'Rakip Ekle',
            competitor_url: 'Rakip Profil URL',
            track_competitor: 'Takip Et',
            competitor_list: 'Takip Edilen Rakipler',
            your_performance: 'Sizin Performansınız',
            competitor_performance: 'Rakip Performansı',
            comparison: 'Karşılaştırma',
            no_competitors: 'Henüz rakip eklenmedi',
            dark_mode: 'Karanlık Mod',
            light_mode: 'Aydınlık Mod',
            theme: 'Tema',
            influencer_finder: 'Influencer Bul',
            find_influencers: 'Influencer Ara',
            search_industry: 'Sektör / Konu',
            min_connections: 'Minimum Bağlantı',
            engagement_score: 'Etkileşim Skoru',
            influencer_score: 'Influencer Skoru',
            bookmark: 'Yer İmi Ekle',
            bookmarked: 'Yer İminde',
            view_profile: 'Profili Gör',
            no_influencers_found: 'Influencer bulunamadı'
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
            suggested_hashtags: 'Suggested Hashtags',
            generate_hashtags: '🏷️ Generate Hashtags',
            hashtag_suggestions: 'Hashtag Suggestions',
            click_to_add: 'Click to add',
            analyzing_content: 'Analyzing content...',
            hashtags_generated: 'Hashtags generated!',
            best_posting_times: 'Best Posting Times',
            hourly_activity: 'Hourly Activity',
            peak_hours: 'Peak Hours',
            recommended_time: 'Recommended Time',
            your_timezone: 'Your Timezone',
            export_data: 'Export Data',
            export_csv: 'Download CSV',
            export_json: 'Download JSON',
            engagement_rate: 'Engagement Rate',
            total_actions: 'Total Actions',
            daily_limit: 'Daily Limit',
            hourly_limit: 'Hourly Limit',
            safety_warning: 'Safety Warning',
            approaching_limit: 'Approaching limit!',
            cooldown_active: 'Cooldown active',
            actions_today: 'Actions today',
            competitor_analysis: 'Competitor Analysis',
            add_competitor: 'Add Competitor',
            competitor_url: 'Competitor Profile URL',
            track_competitor: 'Track',
            competitor_list: 'Tracked Competitors',
            your_performance: 'Your Performance',
            competitor_performance: 'Competitor Performance',
            comparison: 'Comparison',
            no_competitors: 'No competitors added yet',
            dark_mode: 'Dark Mode',
            light_mode: 'Light Mode',
            theme: 'Theme',
            influencer_finder: 'Influencer Finder',
            find_influencers: 'Find Influencers',
            search_industry: 'Industry / Topic',
            min_connections: 'Min Connections',
            engagement_score: 'Engagement Score',
            influencer_score: 'Influencer Score',
            bookmark: 'Bookmark',
            bookmarked: 'Bookmarked',
            view_profile: 'View Profile',
            no_influencers_found: 'No influencers found'
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

                /* CSS Variables for Theming */
                .theme-light {
                    --bg-primary: #ffffff;
                    --bg-secondary: #f8f9fa;
                    --bg-tertiary: #f9fafb;
                    --bg-gradient: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                    --border-color: #e1e5e9;
                    --text-primary: #1c1f23;
                    --text-secondary: #5f6368;
                    --text-tertiary: #6b7280;
                    --text-muted: #9ca3af;
                    --accent-color: #0077b5;
                    --accent-hover: #005885;
                    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
                    --shadow-md: 0 4px 15px rgba(0, 119, 181, 0.3);
                    --shadow-lg: 0 25px 50px rgba(0, 0, 0, 0.25);
                    --input-bg: #f9fafb;
                    --input-border: #d1d5db;
                    --result-bg: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
                    --result-border: #bae6fd;
                    --terminal-bg: #1e1e1e;
                    --terminal-text: #00ff00;
                }

                .theme-dark {
                    --bg-primary: #1a1a1a;
                    --bg-secondary: #2d2d2d;
                    --bg-tertiary: #252525;
                    --bg-gradient: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
                    --border-color: #404040;
                    --text-primary: #e5e5e5;
                    --text-secondary: #b0b0b0;
                    --text-tertiary: #9ca3af;
                    --text-muted: #6b7280;
                    --accent-color: #0a84c1;
                    --accent-hover: #0077b5;
                    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
                    --shadow-md: 0 4px 15px rgba(10, 132, 193, 0.4);
                    --shadow-lg: 0 25px 50px rgba(0, 0, 0, 0.6);
                    --input-bg: #2d2d2d;
                    --input-border: #404040;
                    --result-bg: linear-gradient(135deg, #1e3a4c 0%, #1a3344 100%);
                    --result-border: #2d5a7a;
                    --terminal-bg: #0d0d0d;
                    --terminal-text: #00ff00;
                }

                #modal {
                    transition: all 0.3s ease;
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
                    background: var(--bg-gradient);
                    border-radius: 20px;
                    overflow: hidden;
                    display: flex;
                    border: 1px solid var(--border-color);
                    position: relative;
                    box-shadow: var(--shadow-lg);
                    backdrop-filter: blur(10px);
                    transition: background 0.3s ease, border-color 0.3s ease;
                }

                .sidebar {
                    width: 260px;
                    background: var(--bg-secondary);
                    border-right: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    padding: 25px 0;
                    box-shadow: var(--shadow-sm);
                    transition: background 0.3s ease, border-color 0.3s ease;
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                .sidebar::-webkit-scrollbar {
                    width: 6px;
                }

                .sidebar::-webkit-scrollbar-track {
                    background: var(--bg-tertiary);
                }

                .sidebar::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 3px;
                }

                .sidebar::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-color);
                }

                .brand {
                    padding: 0 25px 25px;
                    font-size: 20px;
                    font-weight: 800;
                    border-bottom: 1px solid var(--border-color);
                    color: var(--accent-color);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    transition: all 0.3s ease;
                }

                .theme-toggle {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .theme-toggle:hover {
                    background: var(--accent-color);
                    color: white;
                    transform: scale(1.05);
                }

                .menu-item {
                    padding: 15px 25px;
                    font-size: 14px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    border-left: 3px solid transparent;
                }

                .menu-item:hover {
                    background: var(--bg-tertiary);
                    color: var(--accent-color);
                    border-left: 3px solid var(--accent-color);
                }

                .menu-item.active {
                    background: var(--bg-tertiary);
                    color: var(--accent-color);
                    font-weight: 700;
                    border-left: 3px solid var(--accent-color);
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
                    background: var(--bg-primary);
                    position: relative;
                    transition: background 0.3s ease;
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
                    color: var(--text-primary);
                    font-size: 24px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: color 0.3s ease;
                }

                textarea, input {
                    width: 100%;
                    padding: 14px;
                    background: var(--input-bg);
                    border: 1px solid var(--input-border);
                    border-radius: 10px;
                    font-size: 15px;
                    margin-bottom: 20px;
                    outline: none;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    color: var(--text-primary);
                }

                textarea:focus, input:focus {
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 3px rgba(10, 132, 193, 0.1);
                    background: var(--bg-primary);
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
                    background: var(--result-bg);
                    border: 1px solid var(--result-border);
                    border-radius: 12px;
                    padding: 25px;
                    margin-top: 25px;
                    white-space: pre-wrap;
                    display: none;
                    line-height: 1.7;
                    font-size: 15px;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
                    color: var(--text-primary);
                    transition: all 0.3s ease;
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
                    background: var(--terminal-bg);
                    color: var(--terminal-text);
                    font-family: 'Courier New', monospace;
                    padding: 20px;
                    border-radius: 12px;
                    height: 250px;
                    overflow-y: auto;
                    margin-top: 20px;
                    font-size: 12px;
                    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
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
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.3s ease;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--accent-color);
                    margin-bottom: 5px;
                    transition: color 0.3s ease;
                }

                .stat-label {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    font-weight: 500;
                    transition: color 0.3s ease;
                }

                .chart-container {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 25px;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.3s ease;
                }

                .chart-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: color 0.3s ease;
                }

                .influencer-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                    transition: all 0.3s ease;
                }

                .influencer-card:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                }

                .influencer-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                    flex-shrink: 0;
                }

                .influencer-info {
                    flex: 1;
                }

                .influencer-name {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 5px;
                    transitio: color 0.3s ease;
                }

                .influencer-title {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 10px;
                    transition: color 0.3s ease;
                }

                .influencer-stats {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin-bottom: 10px;
                }

                .influencer-score-badge {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-block;
                }

                .influencer-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }

                .btn-small {
                    padding: 6px 12px;
                    font-size: 12px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 600;
                }

                .btn-bookmark {
                    background: var(--accent-color);
                    color: white;
                }

                .btn-bookmark:hover {
                    background: var(--accent-hover);
                    transform: scale(1.05);
                }

                .btn-bookmark.bookmarked {
                    background: #10b981;
                }

                .btn-view {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .btn-view:hover {
                    background: var(--accent-color);
                    color: white;
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

                .time-block {
                    height: 40px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .time-block:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .time-block.active-low {
                    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
                }

                .time-block.active-medium {
                    background: linear-gradient(135deg, #60a5fa, #3b82f6);
                }

                .time-block.active-high {
                    background: linear-gradient(135deg, #2563eb, #1e40af);
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
                <div class="dashboard theme-light" id="dashboard-container">
                    <div class="sidebar">
                        <div class="brand">
                            <span>🚀 AI Studio Pro</span>
                            <div class="theme-toggle" id="theme-toggle" title="Toggle Dark Mode">
                                🌙
                            </div>
                        </div>
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
                        <div class="menu-item" data-view="competitor">
                            <span>🎯 Rakip Analizi</span><span class="en">Competitor Analysis</span>
                        </div>
                        <div class="menu-item" data-view="influencer">
                            <span>⭐ Influencer Bul</span><span class="en">Influencer Finder</span>
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
                            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                                <button class="btn" id="btn-post" style="flex: 1;">✨ Üret / Generate</button>
                                <button class="btn btn-secondary" id="btn-hashtags">🏷️ Hashtag Üret / Generate Hashtags</button>
                            </div>
                            <div id="hashtag-suggestions" style="display: none; margin-bottom: 20px;">
                                <div style="font-weight: 600; margin-bottom: 10px; color: #374151;">🏷️ Hashtag Önerileri / Hashtag Suggestions</div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">Eklemek için tıklayın / Click to add</div>
                                <div class="tag-list" id="hashtag-list"></div>
                            </div>
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
                                <div class="stat-card">
                                    <div class="stat-value" id="engagement-rate">0%</div>
                                    <div class="stat-label">Etkileşim Oranı<br>Engagement Rate</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value" id="total-actions">0</div>
                                    <div class="stat-label">Toplam Aksiyon<br>Total Actions</div>
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

                            <div class="chart-container">
                                <div class="chart-title">⏰ En İyi Paylaşım Saatleri / Best Posting Times</div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 15px;">Verilerinize göre optimal saatler / Optimal hours based on your data</div>
                                <div id="time-heatmap" style="display: grid; grid-template-columns: repeat(24, 1fr); gap: 4px; margin-bottom: 15px;">
                                    <!-- Will be populated by JS -->
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; margin-bottom: 15px;">
                                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                                </div>
                                <div id="best-time-recommendation" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px; border-radius: 8px; text-align: center; font-weight: 600;">
                                    🎯 Önerilen saat: 09:00 - 11:00 / Recommended: 09:00 - 11:00
                                </div>
                            </div>

                            <div class="chart-container">
                                <div class="chart-title">📊 Veri Dışa Aktarma / Data Export</div>
                                <div style="display: flex; gap: 10px; margin-top: 15px;">
                                    <button class="btn" id="btn-export-csv" style="flex: 1;">📋 CSV İndir / Download CSV</button>
                                    <button class="btn btn-secondary" id="btn-export-json" style="flex: 1;">📝 JSON İndir / Download JSON</button>
                                </div>
                            </div>

                            <div id="safety-status" class="chart-container" style="display: none;">
                                <div class="chart-title">⚠️ Güvenlik Durumu / Safety Status</div>
                                <div id="safety-message" style="padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; color: #92400e;">
                                    ⚠️ Limite yaklaşıyorsunuz! / Approaching limit!
                                </div>
                            </div>
                        </div>

                        <!-- Competitor Analysis View -->
                        <div id="view-competitor" class="view">
                            <div class="view-header">
                                <h2>🎯 Rakip Analizi / Competitor Analysis</h2>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Rakip Profil URL / Competitor Profile URL</label>
                                <input type="text" id="competitor-url" placeholder="https://linkedin.com/in/...">
                            </div>
                            <button class="btn" id="btn-add-competitor">➕ Rakip Ekle / Add Competitor</button>

                            <div class="chart-container" style="margin-top: 25px;">
                                <div class="chart-title">📄 Takip Edilen Rakipler / Tracked Competitors</div>
                                <div id="competitor-list" style="min-height: 100px;">
                                    <p style="color: #9ca3af; text-align: center; padding: 20px;">Henüz rakip eklenmedi / No competitors added yet</p>
                                </div>
                            </div>

                            <div id="competitor-comparison" class="chart-container" style="display: none;">
                                <div class="chart-title">📉 Performans Karşılaştırması / Performance Comparison</div>
                                <div class="stats-grid" style="margin-top: 20px;">
                                    <div class="stat-card">
                                        <div class="stat-value" style="color: #0077b5;" id="your-score">0</div>
                                        <div class="stat-label">Sizin Skorunuz<br>Your Score</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value" style="color: #dc3545;" id="avg-competitor-score">0</div>
                                        <div class="stat-label">Ortalama Rakip<br>Avg Competitor</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Influencer Finder View -->
                        <div id="view-influencer" class="view">
                            <div class="view-header">
                                <h2>⭐ Influencer Bul / Influencer Finder</h2>
                            </div>

                            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                                <div class="form-group" style="flex: 1; margin-bottom: 0;">
                                    <label class="form-label">Sektör / Industry</label>
                                    <input type="text" id="influencer-industry" placeholder="Örn: Teknoloji, Pazarlama... / e.g.: Technology, Marketing...">
                                </div>
                                <div class="form-group" style="width: 200px; margin-bottom: 0;">
                                    <label class="form-label">Min Bağlantı / Min Connections</label>
                                    <input type="number" id="influencer-min-connections" value="5000" min="500" step="500">
                                </div>
                            </div>
                            <button class="btn" id="btn-find-influencers">🔍 Influencer Ara / Find Influencers</button>

                            <div id="influencer-results" style="display: none; margin-top: 25px;">
                                <div class="chart-container">
                                    <div class="chart-title">⭐ Bulunan Influencer'lar / Found Influencers</div>
                                    <div id="influencer-list" style="display: grid; gap: 15px;">
                                        <!-- Will be populated by JS -->
                                    </div>
                                </div>
                            </div>

                            <div id="bookmarked-influencers" class="chart-container" style="margin-top: 25px;">
                                <div class="chart-title">🔖 Kaydedilen Influencer'lar / Bookmarked Influencers</div>
                                <div id="bookmarked-list" style="min-height: 100px;">
                                    <p style="color: var(--text-muted); text-align: center; padding: 20px;">Henüz influencer eklenmedi / No influencers bookmarked yet</p>
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

        // Theme toggle functionality
        const dashboard = shadow.getElementById('dashboard-container');
        const themeToggle = shadow.getElementById('theme-toggle');
        const savedTheme = GM_getValue('theme', 'light');

        // Apply saved theme
        if (savedTheme === 'dark') {
            dashboard.classList.remove('theme-light');
            dashboard.classList.add('theme-dark');
            themeToggle.innerHTML = '☀️';
        }

        themeToggle.onclick = () => {
            const isDark = dashboard.classList.contains('theme-dark');

            if (isDark) {
                dashboard.classList.remove('theme-dark');
                dashboard.classList.add('theme-light');
                themeToggle.innerHTML = '🌙';
                GM_setValue('theme', 'light');
                showNotification(shadow, lang === 'tr' ? '☀️ Aydınlık tema aktif' : '☀️ Light theme activated');
            } else {
                dashboard.classList.remove('theme-light');
                dashboard.classList.add('theme-dark');
                themeToggle.innerHTML = '☀️';
                GM_setValue('theme', 'dark');
                showNotification(shadow, lang === 'tr' ? '🌙 Karanlık tema aktif' : '🌙 Dark theme activated');
            }
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

        if (savedKey) shadow.getElementById('in-apikey').value = savedKey;
        if (savedRole) shadow.getElementById('in-role').value = savedRole;
        if (savedIndustry) shadow.getElementById('in-industry').value = savedIndustry;
        if (savedLocation) shadow.getElementById('in-location').value = savedLocation;
        if (savedStyle) shadow.getElementById('in-train').value = savedStyle;
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

        // Enhanced anti-ban system
        const getSmartDelay = () => {
            const base = CONFIG.DELAY_BETWEEN_ACTIONS;
            const variance = Math.random() * (CONFIG.MAX_DELAY - CONFIG.MIN_DELAY) + CONFIG.MIN_DELAY;
            const timeSinceLastAction = Date.now() - lastActionTime;

            // Add extra delay if actions are too frequent
            if (timeSinceLastAction < 5000) {
                return variance * 1.5;
            }

            return variance;
        };

        const checkSafetyLimits = (shadow) => {
            const now = Date.now();
            const today = new Date().toISOString().split('T')[0];
            const currentHour = new Date().getHours();

            loadAnalyticsData();

            const todayActions = analyticsData.dailyActions[today] || 0;
            const hourlyActions = analyticsData.hourlyEngagement[currentHour] || 0;

            const safetyStatus = shadow.getElementById('safety-status');
            const safetyMessage = shadow.getElementById('safety-message');
            const lang = navigator.language || navigator.userLanguage;
            const isTurkish = lang.toLowerCase().includes('tr');

            // Check daily limit
            if (todayActions >= CONFIG.MAX_ACTIONS_PER_DAY) {
                if (safetyStatus) {
                    safetyStatus.style.display = 'block';
                    safetyMessage.innerHTML = `🛑 ${isTurkish ? 'Günlük limit aşıldı! Yarın tekrar deneyin.' : 'Daily limit exceeded! Try again tomorrow.'}`;
                    safetyMessage.style.background = '#fee2e2';
                    safetyMessage.style.borderColor = '#dc2626';
                    safetyMessage.style.color = '#7f1d1d';
                }
                return false;
            }

            // Check hourly limit
            if (hourlyActions >= CONFIG.MAX_ACTIONS_PER_HOUR) {
                if (safetyStatus) {
                    safetyStatus.style.display = 'block';
                    safetyMessage.innerHTML = `⏳ ${isTurkish ? 'Saatlik limit aşıldı! 1 saat bekleyin.' : 'Hourly limit exceeded! Wait 1 hour.'}`;
                    safetyMessage.style.background = '#fef3c7';
                    safetyMessage.style.borderColor = '#f59e0b';
                    safetyMessage.style.color = '#92400e';
                }
                return false;
            }

            // Warning when approaching limits
            if (todayActions >= CONFIG.MAX_ACTIONS_PER_DAY * 0.8 || hourlyActions >= CONFIG.MAX_ACTIONS_PER_HOUR * 0.8) {
                if (safetyStatus) {
                    safetyStatus.style.display = 'block';
                    safetyMessage.innerHTML = `⚠️ ${isTurkish ? `Bugün ${todayActions}/${CONFIG.MAX_ACTIONS_PER_DAY} aksiyon. Limite yaklaşıyorsunuz!` : `Today ${todayActions}/${CONFIG.MAX_ACTIONS_PER_DAY} actions. Approaching limit!`}`;
                }
            } else if (safetyStatus) {
                safetyStatus.style.display = 'none';
            }

            return true;
        };

        bStart.onclick = () => {
            if (!checkSafetyLimits(shadow)) {
                const lang = navigator.language || navigator.userLanguage;
                const isTurkish = lang.toLowerCase().includes('tr');
                alert(isTurkish ? '⚠️ Güvenlik limitleri aşıldı. Lütfen bekleyin.' : '⚠️ Safety limits exceeded. Please wait.');
                return;
            }

            bStart.style.display = 'none';
            bStop.style.display = 'inline-block';
            addLog(lang === 'tr' ? "🚀 Booster başlatıldı..." : "🚀 Booster started...");

            boosterInterval = setInterval(() => {
                if (!checkSafetyLimits(shadow)) {
                    clearInterval(boosterInterval);
                    bStart.style.display = 'inline-block';
                    bStop.style.display = 'none';
                    addLog(lang === 'tr' ? "🛑 Güvenlik limiti aşıldı. Durduruldu." : "🛑 Safety limit reached. Stopped.");
                    return;
                }
                const buttons = Array.from(document.querySelectorAll('button')).filter(b =>
                    (b.innerText.trim() === 'Bağlantı kur' || b.innerText.trim() === 'Connect') &&
                    !b.closest('.artdeco-modal')
                );

                if (buttons.length > 0) {
                    addLog(lang === 'tr' ? "👤 Kişi bulundu, bağlantı isteği gönderiliyor..." : "👤 Person found, sending connection request...");
                    const target = buttons[0];
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
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
                                    trackActivityTime('connection');
                                    handled = true;
                                }
                            }
                        });
                        if (!handled) addLog(lang === 'tr' ? "ℹ️ Devam ediliyor..." : "ℹ️ Continuing...");
                    }, 2000);
                } else {
                    addLog(lang === 'tr' ? "🔍 Bağlantı aranıyor..." : "🔍 Searching for connections...");
                }

                lastActionTime = Date.now();
            }, getSmartDelay());
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
                        err.innerHTML = `<b>${lang === 'tr' ? '❌ Hata' : '❌ Error'}: ${res.status}</b><br>${lang === 'tr' ? 'API Key\'inizi kontrol edin.' : 'Please check your API Key.'
                            }<br>${res.statusText}`;
                        err.style.display = 'block';
                        return;
                    }
                    try {
                        const d = JSON.parse(res.responseText);
                        out.innerText = d.candidates[0].content.parts[0].text;
                        out.style.display = 'block';
                        analyticsData.posts++;
                        trackActivityTime('post');
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

        // Hashtag generation function
        const generateHashtags = () => {
            const topic = shadow.getElementById('in-post').value.trim();
            const outPost = shadow.getElementById('out-post').innerText.trim();
            const content = outPost || topic;

            if (!content) {
                alert(lang === 'tr' ? '⚠️ Lütfen önce bir konu girin veya post oluşturun!' : '⚠️ Please enter a topic or generate a post first!');
                return;
            }

            const hashtagContainer = shadow.getElementById('hashtag-suggestions');
            const hashtagList = shadow.getElementById('hashtag-list');
            const btn = shadow.getElementById('btn-hashtags');
            const oldText = btn.innerText;

            btn.innerText = lang === 'tr' ? '⏳ Analiz ediliyor...' : '⏳ Analyzing...';
            btn.disabled = true;

            // AI-powered hashtag generation
            const realKey = GM_getValue('linkedin_apikey', CONFIG.DEFAULT_API_KEY);
            if (!realKey) {
                alert(lang === 'tr' ? "⚠️ Lütfen 'Ayarlar' menüsünden API Key giriniz!" : "⚠️ Please enter API Key in Settings!");
                btn.innerText = oldText;
                btn.disabled = false;
                return;
            }

            const prompt = `Analyze this LinkedIn post content and suggest 8-12 relevant, trending hashtags. Mix popular and niche hashtags. Return ONLY hashtags separated by spaces, each starting with #. Content: "${content}"`;

            GM_xmlhttpRequest({
                method: "POST",
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${realKey}`,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                onload: (res) => {
                    btn.innerText = oldText;
                    btn.disabled = false;

                    if (res.status === 200) {
                        try {
                            const data = JSON.parse(res.responseText);
                            const hashtagText = data.candidates[0].content.parts[0].text;
                            const hashtags = hashtagText.match(/#\w+/g) || [];

                            // Add some from database based on content
                            const industry = detectIndustry(content);
                            const dbHashtags = HASHTAG_DATABASE[industry] || HASHTAG_DATABASE.general;
                            const combinedHashtags = [...new Set([...hashtags, ...dbHashtags.slice(0, 5)])].slice(0, 12);

                            displayHashtags(shadow, combinedHashtags);
                            showNotification(shadow, lang === 'tr' ? '✅ Hashtagler oluşturuldu!' : '✅ Hashtags generated!');
                        } catch (e) {
                            // Fallback to database hashtags
                            const industry = detectIndustry(content);
                            const hashtags = HASHTAG_DATABASE[industry] || HASHTAG_DATABASE.general;
                            displayHashtags(shadow, hashtags.slice(0, 10));
                        }
                    } else {
                        // Fallback to database
                        const industry = detectIndustry(content);
                        const hashtags = HASHTAG_DATABASE[industry] || HASHTAG_DATABASE.general;
                        displayHashtags(shadow, hashtags.slice(0, 10));
                    }
                },
                onerror: () => {
                    btn.innerText = oldText;
                    btn.disabled = false;
                    const industry = detectIndustry(content);
                    const hashtags = HASHTAG_DATABASE[industry] || HASHTAG_DATABASE.general;
                    displayHashtags(shadow, hashtags.slice(0, 10));
                }
            });
        };

        const detectIndustry = (text) => {
            const lowerText = text.toLowerCase();
            const keywords = {
                technology: ['technology', 'software', 'ai', 'artificial intelligence', 'programming', 'developer', 'tech', 'innovation', 'digital', 'cyber'],
                business: ['business', 'entrepreneur', 'startup', 'company', 'management', 'strategy', 'growth', 'revenue', 'profit'],
                finance: ['finance', 'investment', 'trading', 'banking', 'money', 'market', 'stock', 'crypto', 'blockchain'],
                healthcare: ['health', 'medical', 'healthcare', 'hospital', 'doctor', 'patient', 'medicine', 'wellness', 'pharma'],
                education: ['education', 'learning', 'teaching', 'student', 'university', 'course', 'training', 'skill'],
                marketing: ['marketing', 'brand', 'advertising', 'content', 'social media', 'seo', 'campaign', 'customer']
            };

            for (const [industry, words] of Object.entries(keywords)) {
                if (words.some(word => lowerText.includes(word))) {
                    return industry;
                }
            }
            return 'general';
        };

        const displayHashtags = (shadow, hashtags) => {
            const hashtagContainer = shadow.getElementById('hashtag-suggestions');
            const hashtagList = shadow.getElementById('hashtag-list');

            hashtagList.innerHTML = '';
            hashtags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = tag;
                tagEl.style.cursor = 'pointer';
                tagEl.style.transition = 'all 0.2s ease';

                tagEl.onclick = () => {
                    const postTextarea = shadow.getElementById('in-post');
                    const outPost = shadow.getElementById('out-post');

                    // Add to generated post if exists, otherwise to input
                    if (outPost.style.display !== 'none' && outPost.innerText) {
                        outPost.innerText += ' ' + tag;
                    } else {
                        postTextarea.value += ' ' + tag;
                    }

                    tagEl.style.opacity = '0.5';
                    setTimeout(() => {
                        tagEl.style.opacity = '1';
                    }, 200);
                };

                tagEl.onmouseover = () => {
                    tagEl.style.transform = 'scale(1.05)';
                };
                tagEl.onmouseout = () => {
                    tagEl.style.transform = 'scale(1)';
                };

                hashtagList.appendChild(tagEl);
            });

            hashtagContainer.style.display = 'block';
        };

        // Button event handlers
        shadow.getElementById('btn-hashtags').onclick = generateHashtags;
        shadow.getElementById('btn-post').onclick = () => runAI(shadow.getElementById('in-post').value, 'out-post', 'btn-post', 'err-post');
        shadow.getElementById('btn-com').onclick = () => runAI(shadow.getElementById('in-post').value, 'out-com', 'btn-com', 'err-com');
        shadow.getElementById('btn-message').onclick = () => runAI(`${shadow.getElementById('message-content').value} - Profil: ${shadow.getElementById('message-profile').value}`, 'out-message', 'btn-message', 'err-message');
        shadow.getElementById('btn-profile').onclick = () => runAI(`Profil analizi yap: ${shadow.getElementById('profile-url').value}`, 'out-profile', 'btn-profile', 'err-profile');
        shadow.getElementById('btn-discovery').onclick = () => runAI(`İçerik keşfi: ${shadow.getElementById('discovery-topic').value}`, 'out-discovery', 'btn-discovery', 'err-discovery');

        // Export handlers
        shadow.getElementById('btn-export-csv').onclick = () => exportData(shadow, 'csv');
        shadow.getElementById('btn-export-json').onclick = () => exportData(shadow, 'json');

        // Competitor analysis handlers
        shadow.getElementById('btn-add-competitor').onclick = () => addCompetitor(shadow);
        loadCompetitors(shadow);

        // Influencer finder handlers
        shadow.getElementById('btn-find-influencers').onclick = () => findInfluencers(shadow);
        loadBookmarkedInfluencers(shadow);
    }

    // Influencer Finder Functions
    function findInfluencers(shadow) {
        const industry = shadow.getElementById('influencer-industry').value.trim();
        const minConnections = parseInt(shadow.getElementById('influencer-min-connections').value) || 5000;
        const lang = navigator.language || navigator.userLanguage;
        const isTurkish = lang.toLowerCase().includes('tr');

        if (!industry) {
            alert(isTurkish ? '⚠️ Lütfen sektör girin!' : '⚠️ Please enter an industry!');
            return;
        }

        const resultsContainer = shadow.getElementById('influencer-results');
        const influencerList = shadow.getElementById('influencer-list');
        const btn = shadow.getElementById('btn-find-influencers');
        const oldText = btn.innerText;

        btn.innerText = isTurkish ? '⏳ Aranıyor...' : '⏳ Searching...';
        btn.disabled = true;

        // Simulate influencer search (In real scenario, this would scrape LinkedIn)
        setTimeout(() => {
            const mockInfluencers = generateMockInfluencers(industry, minConnections);

            influencerList.innerHTML = mockInfluencers.map((inf, index) => `
                <div class="influencer-card">
                    <div class="influencer-avatar">${inf.avatar}</div>
                    <div class="influencer-info">
                        <div class="influencer-name">${inf.name}</div>
                        <div class="influencer-title">${inf.title}</div>
                        <div class="influencer-stats">
                            <span>🔗 ${formatNumber(inf.connections)} connections</span>
                            <span>📊 ${inf.posts} posts/month</span>
                            <span>❤️ ${inf.engagement}% engagement</span>
                        </div>
                        <span class="influencer-score-badge">⭐ ${inf.score}/100 Influencer Score</span>
                        <div class="influencer-actions">
                            <button class="btn-small btn-bookmark" data-index="${index}">🔖 ${isTurkish ? 'Kaydet' : 'Bookmark'}</button>
                            <button class="btn-small btn-view" data-name="${inf.name.replace(/"/g, '&quot;')}">🔍 ${isTurkish ? 'Profili Gör' : 'View Profile'}</button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add event listeners for buttons
            influencerList.querySelectorAll('.btn-bookmark').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = parseInt(this.getAttribute('data-index'));
                    shadow.host.bookmarkInfluencer(index);
                });
            });

            influencerList.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', function () {
                    const name = this.getAttribute('data-name');
                    window.open(`https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`, '_blank');
                });
            });

            resultsContainer.style.display = 'block';
            btn.innerText = oldText;
            btn.disabled = false;

            // Store current search results and bookmark function
            shadow.host.currentInfluencers = mockInfluencers;

            // Define bookmark function in scope
            shadow.host.bookmarkInfluencer = (index) => {
                const influencer = shadow.host.currentInfluencers[index];
                const bookmarks = JSON.parse(GM_getValue('influencer_bookmarks', '[]'));
                const lang = navigator.language || navigator.userLanguage;
                const isTurkish = lang.toLowerCase().includes('tr');

                // Check if already bookmarked
                const exists = bookmarks.find(b => b.name === influencer.name);
                if (exists) {
                    alert(isTurkish ? '⚠️ Bu influencer zaten kaydedilmiş!' : '⚠️ This influencer is already bookmarked!');
                    return;
                }

                bookmarks.push(influencer);
                GM_setValue('influencer_bookmarks', JSON.stringify(bookmarks));
                loadBookmarkedInfluencers(shadow);
                showNotification(shadow, isTurkish ? '✅ Influencer kaydedildi!' : '✅ Influencer bookmarked!');
            };

            showNotification(shadow, `✅ ${mockInfluencers.length} influencer bulundu! / ${mockInfluencers.length} influencers found!`);
        }, 1500);
    }

    function generateMockInfluencers(industry, minConnections) {
        const names = ['Alex Johnson', 'Sarah Martinez', 'David Chen', 'Emma Williams', 'Michael Brown', 'Lisa Anderson'];
        const avatars = ['👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧑‍💼'];
        const titles = [
            `${industry} Thought Leader`,
            `CEO at ${industry} Solutions`,
            `${industry} Expert & Speaker`,
            `Head of ${industry} Innovation`,
            `${industry} Consultant`,
            `${industry} Strategist`
        ];

        return names.map((name, i) => ({
            name: name,
            avatar: avatars[i],
            title: titles[i],
            connections: Math.floor(Math.random() * 50000) + minConnections,
            posts: Math.floor(Math.random() * 20) + 5,
            engagement: (Math.random() * 8 + 2).toFixed(1),
            score: Math.floor(Math.random() * 30) + 70,
            industry: industry
        })).sort((a, b) => b.score - a.score);
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    }

    function loadBookmarkedInfluencers(shadow) {
        const bookmarks = JSON.parse(GM_getValue('influencer_bookmarks', '[]'));
        const container = shadow.getElementById('bookmarked-list');
        const lang = navigator.language || navigator.userLanguage;
        const isTurkish = lang.toLowerCase().includes('tr');

        if (bookmarks.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">${isTurkish ? 'Henüz influencer eklenmedi' : 'No influencers bookmarked yet'}</p>`;
            return;
        }

        container.innerHTML = bookmarks.map((inf, index) => `
            <div class="influencer-card" style="margin-bottom: 15px;">
                <div class="influencer-avatar">${inf.avatar}</div>
                <div class="influencer-info">
                    <div class="influencer-name">${inf.name}</div>
                    <div class="influencer-title">${inf.title}</div>
                    <div class="influencer-stats">
                        <span>🔗 ${formatNumber(inf.connections)} connections</span>
                        <span>📊 ${inf.posts} posts/month</span>
                    </div>
                    <div class="influencer-actions">
                        <button class="btn-small btn-view" data-name="${inf.name.replace(/"/g, '&quot;')}">🔍 ${isTurkish ? 'Profili Gör' : 'View Profile'}</button>
                        <button class="btn-small btn-remove" data-index="${index}" style="background: #dc3545; color: white;">× ${isTurkish ? 'Kaldır' : 'Remove'}</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for view profile buttons
        container.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function () {
                const name = this.getAttribute('data-name');
                window.open(`https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`, '_blank');
            });
        });

        // Add event listeners for remove buttons
        container.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                shadow.host.removeBookmark(index);
            });
        });

        shadow.host.removeBookmark = (index) => {
            const bookmarks = JSON.parse(GM_getValue('influencer_bookmarks', '[]'));
            bookmarks.splice(index, 1);
            GM_setValue('influencer_bookmarks', JSON.stringify(bookmarks));
            loadBookmarkedInfluencers(shadow);
            showNotification(shadow, isTurkish ? '✅ Influencer kaldırıldı!' : '✅ Influencer removed!');
        };
    }

    // Competitor Analysis Functions
    function addCompetitor(shadow) {
        const url = shadow.getElementById('competitor-url').value.trim();
        const lang = navigator.language || navigator.userLanguage;
        const isTurkish = lang.toLowerCase().includes('tr');

        if (!url || !url.includes('linkedin.com')) {
            alert(isTurkish ? '⚠️ Geçerli bir LinkedIn profil URL\'si girin!' : '⚠️ Enter a valid LinkedIn profile URL!');
            return;
        }

        const competitors = JSON.parse(GM_getValue('competitors', '[]'));

        // Extract profile name from URL
        const profileName = url.split('/in/')[1]?.split('/')[0] || 'Unknown';

        const competitor = {
            url: url,
            name: profileName,
            addedDate: new Date().toISOString(),
            score: Math.floor(Math.random() * 100) + 50 // Mock score
        };

        competitors.push(competitor);
        GM_setValue('competitors', JSON.stringify(competitors));

        shadow.getElementById('competitor-url').value = '';
        loadCompetitors(shadow);
        showNotification(shadow, isTurkish ? '✅ Rakip eklendi!' : '✅ Competitor added!');
    }

    function loadCompetitors(shadow) {
        const competitors = JSON.parse(GM_getValue('competitors', '[]'));
        const listContainer = shadow.getElementById('competitor-list');
        const comparisonContainer = shadow.getElementById('competitor-comparison');
        const lang = navigator.language || navigator.userLanguage;
        const isTurkish = lang.toLowerCase().includes('tr');

        if (competitors.length === 0) {
            listContainer.innerHTML = `<p style="color: #9ca3af; text-align: center; padding: 20px;">${isTurkish ? 'Henüz rakip eklenmedi' : 'No competitors added yet'}</p>`;
            comparisonContainer.style.display = 'none';
            return;
        }

        listContainer.innerHTML = competitors.map((comp, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 10px;">
                <div>
                    <div style="font-weight: 600; color: #1c1f23;">${comp.name}</div>
                    <div style="font-size: 12px; color: #6b7280;">${new Date(comp.addedDate).toLocaleDateString()}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: linear-gradient(135deg, #0077b5, #005885); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${comp.score} pts</span>
                    <button onclick="this.getRootNode().host.removeCompetitor(${index})" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">×</button>
                </div>
            </div>
        `).join('');

        // Show comparison
        comparisonContainer.style.display = 'block';
        loadAnalyticsData();
        const yourScore = analyticsData.connections + analyticsData.posts * 2 + analyticsData.messages;
        const avgCompetitorScore = Math.floor(competitors.reduce((sum, c) => sum + c.score, 0) / competitors.length);

        shadow.getElementById('your-score').textContent = yourScore;
        shadow.getElementById('avg-competitor-score').textContent = avgCompetitorScore;

        // Store removeCompetitor function in shadow root
        shadow.host.removeCompetitor = (index) => {
            const competitors = JSON.parse(GM_getValue('competitors', '[]'));
            competitors.splice(index, 1);
            GM_setValue('competitors', JSON.stringify(competitors));
            loadCompetitors(shadow);
            showNotification(shadow, isTurkish ? '✅ Rakip silindi!' : '✅ Competitor removed!');
        };
    }

    function exportData(shadow, format) {
        loadAnalyticsData();
        const lang = navigator.language || navigator.userLanguage;
        const isTurkish = lang.toLowerCase().includes('tr');

        const data = {
            exportDate: new Date().toISOString(),
            summary: {
                totalConnections: analyticsData.connections,
                totalMessages: analyticsData.messages,
                totalPosts: analyticsData.posts,
                lastReset: new Date(analyticsData.lastReset).toISOString()
            },
            timeTracking: analyticsData.timeTracking || [],
            hourlyEngagement: analyticsData.hourlyEngagement || {},
            dailyActions: analyticsData.dailyActions || {}
        };

        let content, filename, mimeType;

        if (format === 'csv') {
            const csv = [
                'Metric,Value',
                `Total Connections,${data.summary.totalConnections}`,
                `Total Messages,${data.summary.totalMessages}`,
                `Total Posts,${data.summary.totalPosts}`,
                `Export Date,${data.exportDate}`,
                '',
                'Hour,Engagement Count',
                ...Object.entries(data.hourlyEngagement).map(([h, c]) => `${h}:00,${c}`),
                '',
                'Date,Actions',
                ...Object.entries(data.dailyActions).map(([d, c]) => `${d},${c}`)
            ].join('\n');

            content = csv;
            filename = `linkedin-analytics-${Date.now()}.csv`;
            mimeType = 'text/csv';
        } else {
            content = JSON.stringify(data, null, 2);
            filename = `linkedin-analytics-${Date.now()}.json`;
            mimeType = 'application/json';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        showNotification(shadow, isTurkish ? '✅ Veri dışa aktarıldı!' : '✅ Data exported!');
    }

    function updateAnalytics(shadow) {
        loadAnalyticsData();

        shadow.getElementById('connections-count').textContent = analyticsData.connections;
        shadow.getElementById('messages-count').textContent = analyticsData.messages;
        shadow.getElementById('posts-count').textContent = analyticsData.posts;

        const growthRate = Math.min(100, analyticsData.connections * 2);
        shadow.getElementById('growth-rate').textContent = `${growthRate}%`;
        shadow.getElementById('growth-progress').style.width = `${growthRate}%`;

        // Update time heatmap
        updateTimeHeatmap(shadow);
        updateBestTimeRecommendation(shadow);
    }

    function updateTimeHeatmap(shadow) {
        const heatmap = shadow.getElementById('time-heatmap');
        if (!heatmap) return;

        heatmap.innerHTML = '';

        // Get max engagement for scaling
        const maxEngagement = Math.max(...Object.values(analyticsData.hourlyEngagement), 1);

        for (let hour = 0; hour < 24; hour++) {
            const engagement = analyticsData.hourlyEngagement[hour] || 0;
            const intensity = engagement / maxEngagement;

            const block = document.createElement('div');
            block.className = 'time-block';
            block.title = `${hour}:00 - ${engagement} actions`;

            if (intensity > 0.6) {
                block.classList.add('active-high');
            } else if (intensity > 0.3) {
                block.classList.add('active-medium');
            } else if (intensity > 0) {
                block.classList.add('active-low');
            }

            heatmap.appendChild(block);
        }
    }

    function updateBestTimeRecommendation(shadow) {
        const recommendation = shadow.getElementById('best-time-recommendation');
        if (!recommendation) return;

        // Find peak hours
        const hourlyData = Object.entries(analyticsData.hourlyEngagement)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }))
            .sort((a, b) => b.count - a.count);

        if (hourlyData.length === 0) {
            recommendation.innerHTML = '📊 Veri toplanıyor... / Collecting data...';
            return;
        }

        const topHours = hourlyData.slice(0, 3).map(h => h.hour).sort((a, b) => a - b);

        if (topHours.length > 0) {
            const startHour = topHours[0];
            const endHour = topHours[topHours.length - 1] + 1;
            const lang = navigator.language || navigator.userLanguage;
            const isTurkish = lang.toLowerCase().includes('tr');

            recommendation.innerHTML = `🎯 ${isTurkish ? 'Önerilen saat' : 'Recommended'}: ${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`;
        }
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
