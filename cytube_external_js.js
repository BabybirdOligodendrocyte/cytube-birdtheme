/* ===================================
   ALTAR OF VICTORY - CUSTOM CYTUBE SCRIPT
   Complete external JavaScript
   First loads bokitube, then custom features
   =================================== */

// Load bokitube script first
(function() {
    var bokitubeScript = document.createElement('script');
    bokitubeScript.src = 'https://cdn.jsdelivr.net/gh/deafnv/bokitube-server@master/channel/script.min.js';
    bokitubeScript.onload = function() {
        console.log('[Altar of Victory] Bokitube loaded, initializing custom features...');
        initializeCustomFeatures();
    };
    document.head.appendChild(bokitubeScript);
})();

function initializeCustomFeatures() {
    'use strict';
    
    console.log('[Altar of Victory] Loading custom scripts...');
    
    // ===================================
    // EMOTE SYSTEM - FULL OVERLAY WITH FAVORITES
    // ===================================
    
    var EmoteSystem = {
        overlay: null,
        panel: null,
        currentTab: 'favorites',
        favorites: [],
        allEmotes: [],
        
        init: function() {
            var self = this;
            
            setTimeout(function() {
                console.log('[Emote System] Initializing...');
                self.loadFavorites();
                self.createOverlay();
                self.hijackEmoteButton();
                self.loadEmotes();
                console.log('[Emote System] ✓ Ready');
            }, 2000);
        },
        
        loadFavorites: function() {
            try {
                var stored = localStorage.getItem('cytube_favorite_emotes');
                if (stored) {
                    this.favorites = JSON.parse(stored);
                }
            } catch (e) {
                console.log('[Emote System] Could not load favorites');
            }
        },
        
        saveFavorites: function() {
            try {
                localStorage.setItem('cytube_favorite_emotes', JSON.stringify(this.favorites));
            } catch (e) {
                console.log('[Emote System] Could not save favorites');
            }
        },
        
        createOverlay: function() {
            var self = this;
            
            var overlay = document.createElement('div');
            overlay.id = 'custom-emote-overlay';
            overlay.innerHTML = `
                <div id="custom-emote-panel">
                    <div id="custom-emote-header">
                        <h3>Emotes</h3>
                        <button id="custom-emote-close">&times;</button>
                    </div>
                    <div id="custom-emote-tabs">
                        <button class="emote-tab active" data-tab="favorites">★ Favorites</button>
                        <button class="emote-tab" data-tab="all">All Emotes</button>
                    </div>
                    <div id="custom-emote-search">
                        <input type="text" placeholder="Search emotes..." id="emote-search-input">
                    </div>
                    <div id="custom-emote-content">
                        <div class="emote-grid"></div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            this.overlay = overlay;
            this.panel = document.getElementById('custom-emote-panel');
            
            document.getElementById('custom-emote-close').onclick = function() {
                self.closeOverlay();
            };
            
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    self.closeOverlay();
                }
            };
            
            var tabs = document.querySelectorAll('.emote-tab');
            tabs.forEach(function(tab) {
                tab.onclick = function() {
                    tabs.forEach(function(t) { t.classList.remove('active'); });
                    tab.classList.add('active');
                    self.currentTab = tab.dataset.tab;
                    self.renderEmotes();
                };
            });
            
            document.getElementById('emote-search-input').oninput = function(e) {
                self.searchEmotes(e.target.value);
            };
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && overlay.classList.contains('active')) {
                    self.closeOverlay();
                }
            });
        },
        
        hijackEmoteButton: function() {
            var self = this;
            
            var checkButton = setInterval(function() {
                var emoteBtn = document.getElementById('emotelistbtn');
                if (emoteBtn) {
                    clearInterval(checkButton);
                    
                    var newBtn = emoteBtn.cloneNode(true);
                    emoteBtn.parentNode.replaceChild(newBtn, emoteBtn);
                    
                    newBtn.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self.openOverlay();
                        return false;
                    };
                    
                    console.log('[Emote System] Emote button hijacked');
                }
            }, 500);
            
            setTimeout(function() { clearInterval(checkButton); }, 10000);
        },
        
        loadEmotes: function() {
            var self = this;
            
            var checkEmotes = setInterval(function() {
                if (window.CHANNEL && window.CHANNEL.emotes) {
                    clearInterval(checkEmotes);
                    
                    window.CHANNEL.emotes.forEach(function(emote) {
                        self.allEmotes.push({
                            name: emote.name,
                            image: emote.image,
                            source: emote.source || 'channel'
                        });
                    });
                    
                    self.renderEmotes();
                    console.log('[Emote System] Loaded ' + self.allEmotes.length + ' emotes');
                }
            }, 500);
            
            setTimeout(function() { clearInterval(checkEmotes); }, 15000);
        },
        
        openOverlay: function() {
            this.overlay.classList.add('active');
            this.renderEmotes();
            document.getElementById('emote-search-input').value = '';
        },
        
        closeOverlay: function() {
            this.overlay.classList.remove('active');
        },
        
        renderEmotes: function(filteredEmotes) {
            var self = this;
            var grid = document.querySelector('#custom-emote-content .emote-grid');
            grid.innerHTML = '';
            
            var emotesToShow = filteredEmotes || (this.currentTab === 'favorites' 
                ? this.allEmotes.filter(function(e) { return self.isFavorite(e.name); })
                : this.allEmotes);
            
            if (emotesToShow.length === 0 && this.currentTab === 'favorites') {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">No favorite emotes yet. Click the ★ on any emote to add it to favorites!</div>';
                return;
            }
            
            emotesToShow.forEach(function(emote) {
                var item = document.createElement('div');
                item.className = 'emote-item';
                item.innerHTML = `
                    <button class="emote-favorite-btn ${self.isFavorite(emote.name) ? 'favorited' : ''}">★</button>
                    <img src="${emote.image}" alt="${emote.name}">
                    <div class="emote-name">${emote.name}</div>
                `;
                
                item.onclick = function(e) {
                    if (!e.target.classList.contains('emote-favorite-btn')) {
                        self.insertEmote(emote.name);
                    }
                };
                
                item.querySelector('.emote-favorite-btn').onclick = function(e) {
                    e.stopPropagation();
                    self.toggleFavorite(emote.name);
                    this.classList.toggle('favorited');
                };
                
                grid.appendChild(item);
            });
        },
        
        searchEmotes: function(query) {
            if (!query) {
                this.renderEmotes();
                return;
            }
            
            var lowerQuery = query.toLowerCase();
            var filtered = this.allEmotes.filter(function(emote) {
                return emote.name.toLowerCase().includes(lowerQuery);
            });
            
            this.renderEmotes(filtered);
        },
        
        isFavorite: function(emoteName) {
            return this.favorites.indexOf(emoteName) !== -1;
        },
        
        toggleFavorite: function(emoteName) {
            var index = this.favorites.indexOf(emoteName);
            if (index === -1) {
                this.favorites.push(emoteName);
            } else {
                this.favorites.splice(index, 1);
            }
            this.saveFavorites();
            
            if (this.currentTab === 'favorites') {
                this.renderEmotes();
            }
        },
        
        insertEmote: function(emoteName) {
            var chatline = document.getElementById('chatline');
            if (chatline) {
                var currentValue = chatline.value;
                chatline.value = currentValue + (currentValue && !currentValue.endsWith(' ') ? ' ' : '') + emoteName + ' ';
                chatline.focus();
                this.closeOverlay();
            }
        }
    };
    
    // ===================================
    // PROFILE VIEWER WITH REPLY FUNCTIONALITY
    // ===================================
    
    var ProfileViewer = {
        selectedUser: null,
        initialized: false,
        
        init: function() {
            var self = this;
            
            setTimeout(function() {
                console.log('[Profile Viewer] Starting initialization...');
                
                self.setupChatClicks();
                self.setupUserlistClicks();
                
                self.initialized = true;
                console.log('[Profile Viewer] ✓ Initialization complete!');
            }, 3000);
        },
        
        setupChatClicks: function() {
            var self = this;
            var messagebuffer = document.getElementById('messagebuffer');
            
            if (!messagebuffer) {
                console.log('[Profile Viewer] Message buffer not found, retrying...');
                setTimeout(function() { self.setupChatClicks(); }, 1000);
                return;
            }
            
            messagebuffer.addEventListener('click', function(e) {
                var username = e.target.closest('.username');
                if (username) {
                    var usernameText = username.textContent
                        .trim()
                        .replace(/[:\[\]]/g, '')
                        .trim();
                    
                    console.log('[Profile Viewer] Clicked username:', usernameText);
                    self.showProfile(usernameText);
                    return;
                }
                
                var msgContainer = e.target.closest('.chat-msg-container');
                if (msgContainer) {
                    var usernameEl = msgContainer.querySelector('.username');
                    if (usernameEl && e.target !== usernameEl && !usernameEl.contains(e.target)) {
                        var replyTo = usernameEl.textContent
                            .trim()
                            .replace(/[:\[\]]/g, '')
                            .trim();
                        self.replyToUser(replyTo);
                    }
                }
            });
            
            console.log('[Profile Viewer] Chat clicks and message replies enabled');
        },
        
        setupUserlistClicks: function() {
            var self = this;
            var userlist = document.getElementById('userlist');
            
            if (!userlist) {
                console.log('[Profile Viewer] Userlist not found, retrying...');
                setTimeout(function() { self.setupUserlistClicks(); }, 1000);
                return;
            }
            
            userlist.addEventListener('click', function(e) {
                var userItem = e.target.closest('.userlist_item');
                if (!userItem) return;
                
                var username = userItem.textContent
                    .trim()
                    .replace(/^\[.*?\]\s*/, '')
                    .replace(/\(AFK\)/, '')
                    .trim();
                
                console.log('[Profile Viewer] Clicked user in list:', username);
                self.showProfile(username);
            });
            
            console.log('[Profile Viewer] Userlist clicks enabled');
        },
        
        getUserInfo: function(username) {
            var userlist = document.getElementById('userlist');
            var info = {
                username: username,
                rank: 'User',
                afk: false,
                profile: null
            };
            
            if (!userlist) return info;
            
            var items = userlist.querySelectorAll('.userlist_item');
            for (var i = 0; i < items.length; i++) {
                var itemText = items[i].textContent.trim();
                if (itemText.includes(username)) {
                    var rankMatch = itemText.match(/^\[(.*?)\]/);
                    if (rankMatch) {
                        info.rank = rankMatch[1];
                    }
                    
                    info.afk = itemText.includes('(AFK)');
                    
                    var userSpan = items[i].querySelector('.userlist_name');
                    if (userSpan && userSpan.dataset) {
                        info.profile = {
                            image: userSpan.dataset.profile_image || null,
                            text: userSpan.dataset.profile_text || null
                        };
                    }
                    break;
                }
            }
            
            return info;
        },
        
        getRankColor: function(rank) {
            var colors = {
                'Owner': '#e74c3c',
                'Admin': '#e67e22',
                'Moderator': '#3498db',
                'Leader': '#9b59b6',
                'Member': '#27ae60',
                'Guest': '#95a5a6',
                'User': '#7f8c8d'
            };
            
            for (var key in colors) {
                if (rank.indexOf(key) !== -1) {
                    return colors[key];
                }
            }
            
            return colors['User'];
        },
        
        showProfile: function(username) {
            var self = this;
            console.log('[Profile Viewer] Showing profile for:', username);
            
            var existing = document.getElementById('custom-profile-modal');
            if (existing) existing.remove();
            var existingBackdrop = document.getElementById('profile-backdrop');
            if (existingBackdrop) existingBackdrop.remove();
            
            var userInfo = self.getUserInfo(username);
            var rankColor = self.getRankColor(userInfo.rank);
            var statusColor = userInfo.afk ? '#f39c12' : '#27ae60';
            var statusText = userInfo.afk ? 'AFK' : 'ONLINE';
            
            var profileContent = '';
            if (userInfo.profile && (userInfo.profile.image || userInfo.profile.text)) {
                profileContent = '<div style="border-top: 1px solid #333; padding-top: 15px; margin-top: 15px;">';
                
                if (userInfo.profile.image) {
                    profileContent += '<div style="margin-bottom: 15px;"><img src="' + userInfo.profile.image + '" style="max-width: 100%; border-radius: 8px;"></div>';
                }
                
                if (userInfo.profile.text) {
                    profileContent += '<div style="color: #ccc; line-height: 1.6;">' + userInfo.profile.text + '</div>';
                }
                
                profileContent += '</div>';
            }
            
            var backdrop = document.createElement('div');
            backdrop.id = 'profile-backdrop';
            backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; cursor: pointer;';
            
            var modal = document.createElement('div');
            modal.id = 'custom-profile-modal';
            modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #2a2a2a 0%, #1a1a2e 100%); border: 2px solid #3a3a3a; border-radius: 12px; padding: 0; z-index: 10000; min-width: 400px; max-width: 500px; box-shadow: 0 10px 40px rgba(0,0,0,0.7); overflow: hidden;';
            
            modal.innerHTML = `
                <div style="background: linear-gradient(135deg, ${rankColor} 0%, ${rankColor}99 100%); padding: 20px; position: relative;">
                    <button id="close-profile" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.3); border: none; color: #fff; font-size: 24px; cursor: pointer; padding: 0; width: 35px; height: 35px; border-radius: 50%; transition: background 0.2s ease;">&times;</button>
                    
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #fff; font-weight: bold; border: 3px solid rgba(255,255,255,0.3);">
                            ${username.charAt(0).toUpperCase()}
                        </div>
                        
                        <div style="flex: 1;">
                            <h2 style="margin: 0 0 8px 0; color: #fff; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                ${username}
                            </h2>
                            <div style="display: flex; gap: 8px;">
                                <span style="background: ${statusColor}; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                                    ${statusText}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 20px; color: #ccc;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                            Rank
                        </div>
                        <div style="font-size: 18px; color: ${rankColor}; font-weight: bold;">
                            ${userInfo.rank}
                        </div>
                    </div>
                    
                    ${profileContent}
                    
                    <div style="border-top: 1px solid #333; padding-top: 15px; margin-top: 15px;">
                        <div style="display: flex; gap: 10px;">
                            <button id="reply-user" style="flex: 1; padding: 10px; background: #27ae60; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s ease;">
                                💬 Reply
                            </button>
                            <button id="pm-user" style="flex: 1; padding: 10px; background: #3498db; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s ease;">
                                ✉️ PM
                            </button>
                            <button id="mention-user" style="flex: 1; padding: 10px; background: #9b59b6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s ease;">
                                @ Mention
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
            
            function closeModal() {
                modal.remove();
                backdrop.remove();
            }
            
            document.getElementById('close-profile').onclick = closeModal;
            backdrop.onclick = closeModal;
            
            document.getElementById('reply-user').onclick = function() {
                self.replyToUser(username);
                closeModal();
            };
            
            document.getElementById('pm-user').onclick = function() {
                var chatline = document.getElementById('chatline');
                if (chatline) {
                    chatline.value = '/pm ' + username + ' ';
                    chatline.focus();
                    closeModal();
                }
            };
            
            document.getElementById('mention-user').onclick = function() {
                var chatline = document.getElementById('chatline');
                if (chatline) {
                    var currentValue = chatline.value;
                    chatline.value = currentValue + (currentValue ? ' ' : '') + '@' + username + ' ';
                    chatline.focus();
                    closeModal();
                }
            };
            
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        },
        
        replyToUser: function(username) {
            var chatline = document.getElementById('chatline');
            if (chatline) {
                chatline.value = '@' + username + ' ';
                chatline.focus();
            }
        }
    };
    
    // ===================================
    // INITIALIZE ALL SYSTEMS
    // ===================================
    
    EmoteSystem.init();
    ProfileViewer.init();
    
    // Expose to global scope for debugging
    window.EmoteSystem = EmoteSystem;
    window.ProfileViewer = ProfileViewer;
    
    console.log('[Altar of Victory] ✓ All systems loaded successfully!');
}
    
})();
