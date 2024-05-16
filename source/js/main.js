
window.history.replaceState(null, null, window.location.href);

let char_list = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const chars = ['$','%','#','@','&','(',')','=','*','/'];
const charsTotal = chars.length;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let title = '999leaks.xyz';
let i = 0;
setInterval(() => {
    document.title = title.substring(0, i + 1);
    if (i == 0) {
        direction = 1;
    } else if (i == title.length) {
        direction = -1;
    }
    i += direction;
}, 400);


var timerStart = Date.now();

function notify(data) {
    $('.toast').hide(); 
    M.toast({html: data});
}

var ping_powtorki = [];

String.prototype.escape = function() {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};

Number.prototype.pad = function() {
    return (this < 10 ? '0' : '') + this;
}

function addEmojiToText(emo) {
    let messageContent = $("#textarea_chatbox").val()
    $("#textarea_chatbox").val(messageContent + emo)
}

async function loadPing(final_iterator) {
    for (var i = 1; i < final_iterator+1; i++) {
        if(ping_powtorki[ip_table[i]]) {
            $("#search_results_loading_"+i).html(ping_powtorki[ip_table[i]])
            continue;
        }
        await $.post("source/php_modules/getPing.php", {ip: ip_table[i]}, function(response) {
            ping_powtorki[ip_table[i]] = response;
            $("#search_results_loading_"+i).html(response)
        }).fail(function(){
            $("#search_results_loading_"+i).html("<font color=red>:(</font>")
        })
    }
}

async function loadVotes(final_iterator) {
    const __subLoad = async(i, fnc) => {
        if(i < final_iterator+1) {
            await $.post(location.origin+"/source/php_modules/request_votes.php", {leak_id: vote_table[i]}, function(response) {
                var answer = JSON.parse(response);
                $("#leakup_"+answer.id).html(answer.up);
                $("#leakdown_"+answer.id).html(answer.down);
            })
            i++;
            
            setTimeout(() => {
                fnc(i, fnc)
            }, 50)
        }
    }
    __subLoad(1, __subLoad)
}

function vote_up(id){
    $.post(location.origin+"/source/php_modules/rate_up.php",
    {
        "leak_id": id,
    },
    function(data) {
        if(data.includes("api_good")) {
            var el = document.getElementById("leakup_"+id);
            var state = el.innerHTML;
            el.innerHTML = parseInt(state)+1;
            notify("Successfully voted.")
        } else {
            if(data.includes("api_update")) {
                notify("Previous vote has been updated.")
                var el = document.getElementById("leakup_"+id);
                var state = el.innerHTML;
                el.innerHTML = parseInt(state)+1;

                var el = document.getElementById("leakdown_"+id);
                var state = el.innerHTML;
                el.innerHTML = parseInt(state)-1;
            } else {
                if(data.includes("api_remove")) {
                    notify("Previous vote has been deleted.")
                    var el = document.getElementById("leakup_"+id);
                    var state = el.innerHTML;
                    el.innerHTML = parseInt(state)-1;
                } else {
                    notify(data);
                }
            }
        }
    });
}

function vote_down(id){
    $.post(location.origin+"/source/php_modules/rate_down.php",
    {
        "leak_id": id,
    },
    function(data) {
        if(data.includes("api_good")) {
            var el = document.getElementById("leakdown_"+id);
            var state = el.innerHTML;
            el.innerHTML = parseInt(state)+1;
            notify("Successfully voted.")
        } else {
            if(data.includes("api_update")) {
                notify("Previous vote has been updated.")
                var el = document.getElementById("leakup_"+id);
                var state = el.innerHTML;
                el.innerHTML = parseInt(state)-1;

                var el = document.getElementById("leakdown_"+id);
                var state = el.innerHTML;
                el.innerHTML = parseInt(state)+1;
            } else {
                if(data.includes("api_remove")) {
                    notify("Previous vote has been deleted.")
                    var el = document.getElementById("leakdown_"+id);
                    var state = el.innerHTML;
                    el.innerHTML = parseInt(state)-1;
                } else {
                    notify(data);
                }
            }
        }
    });
}

async function delete_from_database(name) {
    if(!name) { return; }

    var deleteTimer = Date.now();
    notify("Deleting from database..")
    await $.post(location.origin+"/source/php_modules/request_search.php",
    {
        "name_find": name,
        "type": current_type,
        "admin_remove": true,
    },
    function(data) {
        var decode = JSON.parse(data)
        if(decode.length == 0){
            var ms = Date.now()-deleteTimer
            notify("Successfully deleted in "+ms+" ms")
            $(".modal-close").click();
        } else {
            notify("An error occurred [no_access]"+data)
        }
    });
}

emojis_showed = false
current_type = false;
current_player = false;
search_this = false;
var ip_table = [];
var vote_table = [];

function __action_search(type) {
    var find_value = $("#inputFind_element").val();
    if(find_value.length < 3 || find_value.length > 16) {
        notify("Invalid nickname!")
        return;
    }
    if(this.search_block) {
        return;
    }

    search_this = this;
    this.search_block = true;
    $("#inputFind_element").val("");
    notify("Request sended, please wait..")

    ping_powtorki = []
    ip_table = []
    vote_table = []
    current_player = false;

    var searchTimerStart = Date.now();
    $.post(location.origin+"/source/php_modules/request_search.php", {name_find: find_value, type}, function(response) {
        var ms = Date.now()-searchTimerStart
        notify("Search time: "+ms+" ms.")
        search_this.search_block = false;
        var json_decode = JSON.parse(response);
        if(json_decode.error) {
            notify(json_decode.error);
            search_this.search_block = false;
        } else {
            if(json_decode.length < 1) {
                notify("Not found any results 🙃")
                return;
            }
            current_player = find_value;
            current_type = type;
            $("#search_results_name").text(find_value);
            $("#search_results_image").attr("src", "https://minotar.net/helm/"+find_value+"/64")
            $("#lookupasdasd").text(parseInt($("#lookupasdasd").text()) + 1);
            var build_html = "";
            const elem = document.getElementById('search_results');
            const instance = M.Modal.init(elem, {dismissible: true});
            instance.open();
            var iterator = 0;
            json_decode.forEach(function(e, i, a) {
                var login = e.login;
                var ip = e.ip;

                if(!login || login == null) {
                    login = find_value;
                }

                if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(e.ip)) {
                    iterator++;
                    ip_table[iterator] = e.ip;
                    vote_table[iterator] = e.id;
                    build_html = build_html + "<tr><td>"+login+" (<span style='color:green;' class='vote_up' id='leakup_"+e.id+"' onclick='vote_up(\""+e.id+"\"); return false;'>..</span>/<span style='color:red;' class='vote_down' id='leakdown_"+e.id+"' onclick='vote_down(\""+e.id+"\"); return false;'>..</span>)</td><td class='copyElement'><span class='copySpan'>"+e.ip+"</span></td><td>"+e.pochodzenie+"</td><td><span id='search_results_loading_"+iterator+"'>loading..</span></td></tr>"
                }
            });
            loadPing(iterator);
            loadVotes(iterator);
            $("#search_results_table").html(build_html);

            $('tr').each(function(){
                $(this).find('.copyElement').on("click", function() {
                    navigator.clipboard.writeText($(this).find('.copySpan').text());
                    notify("Address IP has been copied to clipboard.")
                });
            });
            //reloadColors(false, true);

            search_this.search_block = false;
        }
    }).fail(function(){
        search_this.search_block = false;
        notify("An error occurred [4]!")
    })
}

class leak {    
    blocked=false;
    allow_search=false;
    search_block = false;

    get session() {
        return this.getSession();
    }

    getSession() {
      if(this.blocked) {
          return false;
      }
      return $.cookie("999leaks_sessionID");
    }

    get __module_setName_load(){
        if(this.blocked) {
            return false;
        }
        $("#module_search").load(location.origin+"/source/php_modules/html_sub_modules/nickname.html", function() {
            const elem = document.getElementById('nickname');
            const instance = M.Modal.init(elem, {dismissible: false});
            instance.open();

            $("#divName_input").on('click', function() {
                $("#inputName_element").select();
            })

            $(document).on('keypress', 'input', function(e) {
                if((e.keyCode == 13 || e.keyCode == 3) && e.target.type !== 'submit') {
                    $("#nickname_button").click();
                }
            });

            var requestBlock = false;

            $("#nickname_button").on('click', function() {
                if(requestBlock) return;
                var name_value = $("#inputName_element").val();

                if(name_value.length < 3 || name_value.length > 12) {
                    notify("Nickname must be between 3 and 12 characters long!")
                    return;
                }

                if(name_value.indexOf(" ") !== -1) {
                    notify("Nickname must don't have spaces!")
                    return;
                }

                var regex = /^[a-zA-Z0-9&@.$%\-,():;* ]+$/;
                if(!regex.test(name_value)) {
                    notify("Nickname must don't have special characters!")
                }
                requestBlock = true;

                $.post(location.origin+"/source/php_modules/setnickname.php", {name: name_value}, function(response) {
                    var decode = JSON.parse(response)
                    if(decode.error) {
                        notify(decode.error)
                        requestBlock = false;
                        return;
                    }
                    if(decode.success) {
                        notify("Account successfully updated!")
                        $("#module_search").html("");
                        l__module_search_load();
                    }
                }).fail(function(){
                    requestBlock = false;
                    notify("An error occurred [5]!")
                });

            })
        });
    }

    get __module_search_load() {
        if(this.blocked) {
            return false;
        }
        var b_this = this;
        $("#module_search").load(location.origin+"/source/php_modules/modal_search.php", function(response) {
            if(response.indexOf("requestName") !== -1) {
                l__module_setName_load();
                return;
            }

            b_this.allow_search=true;

            $("#divFind_input").on('click', function() {
                $("#inputFind_element").select();
            })

            $("#logout_button").on('click', function() {
                $.removeCookie('999leaks_sessionID', { path: '/' });
                location.reload();
                window.location.href = window.location.href;
            })

            $(document).on('keypress', 'input', function(e) {
                if((e.keyCode == 13 || e.keyCode == 3) && e.target.type !== 'submit') {
                    $("#search_button").click();
                }
            });

            $("#delete_from_database").on('click', function() {
                delete_from_database(current_player)
            })

            $.fn.important = function(key, value) {
                var q = Object.assign({}, this.style)
                q[key] = `${value}!important`;
                $(this).css("cssText", Object.entries(q).filter(x => x[1]).map(([k, v]) => (`${k}: ${v}`)).join(';'));
            };

            let colors_settings;
            if(colors.length > 2) {
                colors_settings = JSON.parse(colors);
            } else {
                colors_settings = ["#111111", "#212121", "#353535", "#ffffff", "#808080", "#7f0000", "#9e9e9e", "#7f0000"];
            }

            function reloadColors(restart, block_noti) {
                if(name_session == "swieta") {
                    if(!block_noti) {
                        notify("ERROR: You don't have access!")
                    }
                    return;
                }
                if(restart) {  
                    colors_settings = ["#111111","#212121","#353535","#ffffff","#808080","#00ff91","#9e9e9e","#00ff91"];
                    $.post(location.origin+"/source/php_modules/save_colors.php", {colors: "default"})
                    notify("Successfully loaded default colors.")
                } else {
                    $.post(location.origin+"/source/php_modules/save_colors.php", {colors: JSON.stringify(colors_settings)})
                    if(!block_noti) {
                        notify("Successfully loaded custom colors.")
                    }
                }

                $("#colors_site_background").val(colors_settings[0])
                $("#colors_site_background_window").val(colors_settings[1])
                $("#colors_site_background_button").val(colors_settings[2])
                $("#colors_site_lighter_text").val(colors_settings[3])
                $("#colors_site_darker_text").val(colors_settings[4])
                $("#colors_site_lines_color").val(colors_settings[5])
                $("#colors_site_input_text").val(colors_settings[6])
                $("#colors_site_accountdata_text").val(colors_settings[7])

                $('body').each(function() {
                    if(!block_noti) {
                        this.style.setProperty('transition', 'background-color 1s ease', 'important');
                    }
                    this.style.setProperty('background-color', colors_settings[0], 'important');
                });

                $('#search_results, .card, .card-content').css('background-color', colors_settings[1]);

                $('.btn').important('background-color', colors_settings[2]);
                $("#chatbox_btn").css('background-color', colors_settings[2]);

                $('a').css('color', colors_settings[3]);

                $('.input-field>label').css('color', colors_settings[4]);
                $('#module_search > div.toffyCenter > div.card-partnership > center > div > h1 > b').css('color', colors_settings[4]);
                $('#chatbox_btn > h4').css('color', colors_settings[4]);
                $('#divFind_input > label').important('color', colors_settings[4]);
                $('#search_results_table > tr > td').css('color', colors_settings[4]);
                $('#search_results > div > center > ul > table > thead > tr > th').css('color', colors_settings[4]);

                $('.resultLine').css('border-bottom', '2px solid '+colors_settings[5]);
                $('input[type=text]').each(function() {
                    this.style.setProperty('border-bottom', '1px solid '+colors_settings[5], 'important');
                    this.style.setProperty('-webkit-box-shadow', '0 1px 0 0 '+colors_settings[5], 'important');
                    this.style.setProperty('box-shadow', '0 1px 0 0 '+colors_settings[5], 'important');
                });

                $('input[type=text]').css('color', colors_settings[6]);

                $('#module_search > div.toffyCenter > div.card-partnership > center > div > h1 > font').css('color', colors_settings[7]);
            }
            reloadColors(false, true)

            $("#colors_site_background_update").on('click', function() {
                var color = $("#colors_site_background").val();
                colors_settings[0] = color;
                reloadColors()
            })

            $("#colors_site_background_window_update").on('click', function() {
                var color = $("#colors_site_background_window").val();
                colors_settings[1] = color;
                reloadColors()
            })

            $("#colors_site_background_button_update").on('click', function() {
                var color = $("#colors_site_background_button").val();
                colors_settings[2] = color;
                reloadColors()
            })

            $("#colors_site_lighter_text_update").on('click', function() {
                var color = $("#colors_site_lighter_text").val();
                colors_settings[3] = color;
                reloadColors()
            })

            $("#colors_site_darker_text_update").on('click', function() {
                var color = $("#colors_site_darker_text").val();
                colors_settings[4] = color;
                reloadColors()
            })

            $("#colors_site_lines_color_update").on('click', function() {
                var color = $("#colors_site_lines_color").val();
                colors_settings[5] = color;
                reloadColors()
            })

            $("#colors_site_input_text_update").on('click', function() {
                var color = $("#colors_site_input_text").val();
                colors_settings[6] = color;
                reloadColors()
            })

            $("#colors_site_accountdata_text_update").on('click', function() {
                var color = $("#colors_site_accountdata_text").val();
                colors_settings[7] = color;
                reloadColors()
            })

            $("#colors_site_restore_default").on('click', function() {
                reloadColors(true)
            })

            $("#settings_button").on('click', function() {
                if(this.search_block) {
                    return;
                }

                const elem = document.getElementById('settings_modal');
                const instance = M.Modal.init(elem, {dismissible: true});
                instance.open();
            })
            
            $("#tos_button").on('click', function() {
                if(this.search_block) {
                    return;
                }

                const elem = document.getElementById('tos_modal');
                const instance = M.Modal.init(elem, {dismissible: true});
                instance.open();
            })
            
            $("#textarea_chatbox").on('input', () => {
                let chatBoxContent = $("#textarea_chatbox").val();
                let emojis = chatBoxContent.match(/(?<=:)\w+(?=:)/g) || [];
                if(emojis.length > 0) {
                    emojis.forEach((emoji) => {
                        if(emojs[emoji]){
                            chatBoxContent = chatBoxContent.replaceAll(":"+emoji+":", emojs[emoji])
                        }
                    })

                    $("#textarea_chatbox").val(chatBoxContent)
                }
            })

            $("#showEmoji").on('click', () => {
                if(emojis_showed) {
                    emojis_showed = false
                    $("#chatbox_content").show()
                    $("#emoijs_content").hide()
                    $("#emoijs_content").html("")
                    document.getElementById("chatcontent").scrollIntoView({block: "end", inline: "nearest"})
                } else {
                    emojis_showed = true
                    $("#chatbox_content").hide()

                    let build_html = `<div style="display: contents;">`

                    for (let emoji in emojs) {
                        build_html += `
                            <div class="emojiIcon">
                                <span class="tooltipped" data-position="top" onclick="addEmojiToText('${emojs[emoji]}')" data-tooltip=":${emoji}:">${emojs[emoji]}</span>
                            </div>
                        `
                        //console.log(emoji)
                    }

                    build_html += "</div>"
                    
                    $("#emoijs_content").html(build_html)
                    M.AutoInit()

                    $("#emoijs_content").show()
                    document.getElementById("chatcontent").scrollIntoView({block: "start", inline: "nearest"})
                }
            })

            $("#__chatbox_clear_button").on('click', () => {
                $.post(location.origin+"/source/php_modules/clearChatbox.php", {}, function(response) {
                    if(response.includes("ok")) {
                        l__refreshChatBox();
                        $("#textarea_chatbox").val("")
                    } else {
                        notify(response)
                    }
                }).fail(function(){
                    notify("An error occurred [1]!")
                })
            })

            $("#__chatbox_send_button").on('click', () => {
                let messageContent = $("#textarea_chatbox").val()
                
                if(messageContent.length < 2 || messageContent.length > 64) {
                    notify("Invalid message length (min. 2, max. 64)!")
                    return;
                }

                $.post(location.origin+"/source/php_modules/sendMessageChatbox.php", {messageContent}, function(response) {
                    if(response.includes("ok")) {
                        l__refreshChatBox();
                        $("#textarea_chatbox").val("")
                    } else {
                        notify(response)
                    }
                }).fail(function(){
                    notify("An error occurred [1]!")
                })
            })

            /* Chatbox refreshing */

            setInterval(() => {
                var element = $("#__chatbox_global");
                if($(element).is(":visible")) {
                    l__refreshChatBox()
                }
            }, 1000)

            $("#search_button").on('click', () => { __action_search(0) })
            $("#search_button_slow").on('click', () => { __action_search(1) })

            $("a.focusme").hover(function(){
                $(this).find('img').css("opacity", "0.8");          
            }, function(){
                $(this).find('img').css("opacity", "1"); 
            });

            $("#chatbox_btn")
            .mouseover(function() {
                $($("#chatbox_btn")[0]).css("background-color", "rgba(33, 33, 33, 0.8)")
            })
            .mouseleave(function(){
                $($("#chatbox_btn")[0]).css("background-color", "rgba(33, 33, 33, 1)")
            })

            $('.modal').modal();

            var options = {
                "inDuration":100,
                "outDuration":100,
                "enterDelay":50,
                "exitDelay":50,
                "margin":-65,
                "transitionMovement":1,
              };
            $('.tooltipped').tooltip(options);
        })
    }

    get __module_login_load() {
        $("#module_login").load(location.origin+"/modal_login.html", function(){
            $("#divLogin_input").on('click', function() {
                $("#inputLogin_element").select();
            })
    
            $(document).on('keypress', 'input', function(e) {
                if((e.keyCode == 13 || e.keyCode == 3) && e.target.type !== 'submit') {
                    $("#login_button").click();
                }
            });

            $("#login_button").on('click', function() {
                var input_key = $("#inputLogin_element").val();
                if(input_key.length < 2) {
                    notify("Invalid key!");
                    return;
                }
                notify("Logging!");
                $.post(location.origin+"/source/php_modules/login.php", {key_data: input_key}, function(response) {
                    var json_decode = JSON.parse(response);
                    if(json_decode.error) {
                        notify(json_decode.error);
                    } else {
                        if(json_decode.success == true) {
                            notify("Logged in, loading..");
                            location.reload();
                        } else {
                            notify("An error occurred [0]!")
                        }
                    }
                }).fail(function(){
                    notify("An error occurred [1]! (location.origin: "+location.origin+")")
                })
            })
        });
    }

    __refreshChatBox() {
        $.post(location.origin+"/source/php_modules/getChatbox.php", {}, function(response) {
            const ranks = ['User', 'VIP', 'Support', 'ADMIN']
            const colors = ['rgba(33, 33, 33)', '#380A2E', '#00F3FF', '#880808']
            let json_decode = JSON.parse(response);
            let html_builder = "";
            
            json_decode.forEach(message => {
                let messageTime = new Date(message.time * 1000);
                let messageTimeParsed = messageTime.getDate().pad(2)+"/"+((messageTime.getMonth()+1).pad(2))+"/"+(messageTime.getFullYear()).pad(2)+" "+(messageTime.getHours()).pad(2)+":"+(messageTime.getMinutes()).pad(2);
                html_builder += `
                    <li class="chatbox_message">
                        <div style="display: flex;">
                            <font face="verdana" class="chatboxMessage chatboxMargin" size="1" style="position: relative; top: 2px;">
                              <b>${(message.author.username).escape()}</b>
                            </font>
                            ${Number(message.author.rank) > 0 ? `
                                <font face="verdana" class="chatboxMessage chatboxMargin" size="1" style="position: relative; top: 2px; background-color: ${colors[Number(message.author.rank)]};">
                                    <b>${ranks[Number(message.author.rank)]}</b>
                                </font>
                            ` : ""}
                            <font face="verdana" class="chatboxMessage chatboxMargin" size="1" style="position: relative; top: 2px; margin-left: auto; right: 5px;">
                                <b>${messageTimeParsed}</b>
                            </font>
                        </div>
                        <div style="height: 2px;"></div>
                        <font class="chatboxMargin" face="verdana" size="2" style="display: block; word-break: initial;">
                            <span>${(message.message).escape()}</span>
                        </font>
                    </li>
                `;
            })

            $("#chatbox_content").html(html_builder)
        }).fail(function(){
            notify("An error occurred [1]!")
        })
    }

    __showChatBox() {
        if(this.blocked || !this.allow_search) {
            return false;
        }
        $("#__chatbox_clear_button").hide()
        var element = $("#__chatbox_global");
        if($(element).is(":visible")) {
            this.__hideChatBox();
        } else {
            $.post(location.origin+"/source/php_modules/isAdmin.php", {}, function(response) {
                if(response.includes("3")) {
                    $("#__chatbox_clear_button").show()
                }
            }).fail(function(){
                notify("An error occurred [1]!")
            })
            $(element).show("slow");
            this.__refreshChatBox();
        }
    }

    __hideChatBox() {
        $("#__chatbox_global").hide("fast");
    }

    get __init__() {
        var ms = Date.now()-timerStart
        console.log("%c+","padding: 300px 400px; background: url('https://i.pinimg.com/originals/62/c9/3a/62c93a4cf6462f54fdea6d735d927f9c.gif');");
        console.log("%cWait!","color:red;font-family:system-ui;font-size:4rem;-webkit-text-stroke: 1px black;font-weight:bold");
        console.log("%cDo not paste anything here!","color:red;font-family:system-ui;font-size:2rem;-webkit-text-stroke: 1px black;font-weight:bold");
        console.log("%cSite loaded in "+ms+" ms!","color:green;font-family:system-ui;font-size:1rem;-webkit-text-stroke: 1px black;font-weight:bold");

        var element = new Image();
        Object.defineProperty(element, 'id', {
          get: function () {
            $("body").html("<center><h2 style='color:red;'>ACCESS BLOCKED</h2></center>")
            window.location.href = "https://tenor.com/view/kobe-bryant-umad-you-mad-gif-4925293";
            location.reload();
            this.blocked=true;
          }
        });
        console.log('%c', element);
    }
}

function l__module_search_load(){
    leak["__module_search_load"];
}

function l__refreshChatBox(){
    leak["__refreshChatBox"]();
}

function l__module_setName_load(){
    leak["__module_setName_load"];
}

function chatbox_process(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
        let messageContent = $("#textarea_chatbox").val()
                
        if(messageContent.length < 2 || messageContent.length > 64) {
            notify("Invalid message length (min. 2, max. 64)!")
            return;
        }

        $.post(location.origin+"/source/php_modules/sendMessageChatbox.php", {messageContent}, function(response) {
            if(response.includes("ok")) {
                l__refreshChatBox();
                $("#textarea_chatbox").val("")
            } else {
                notify(response)
            }
        }).fail(function(){
            notify("An error occurred [1]!")
        })
    }
}

function checkCookies() {
    if (navigator.cookieEnabled) return true;
    document.cookie = "cookietest=1";
    var ret = document.cookie.indexOf("cookietest=") != -1;
    document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    if(!ret) {
        alert("Your browser do not support cookies!");
        return false
    }
}


$(document).ready(function(){
    if(!checkCookies()) {
        $("body").html("<center><h2 style='color:red;'>UNSUPPORTED BROWSER</h2></center>")
        return;
    }
    
    if($.cookie("999leaks_sessionID")) {
        leak = new leak();
        leak["__init__"];
        $("#module_login").hide();
        $("#module_search").show();
        leak["__module_search_load"];
    } else {
        leak = new leak();
        leak["__init__"];
        leak["__module_login_load"];
    }
})