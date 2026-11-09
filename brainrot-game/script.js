/* ============================================================
   Brainrot Grid: Higher or Lower — game logic
   ============================================================ */

/* ============================================================
   BRAINROT DATABASE — flat deck of pop-culture metrics
   Each card: { title, icon, value, unit }
   ============================================================ */
const brainrotDatabase = [
  { icon: "🚽", title: "Skibidi Toilet Views", value: 45000000, unit: "views" },
  { icon: "🗿", title: "Gigachad Wallpaper DLs", value: 6400000, unit: "downloads" },
  { icon: "👑", title: "Ohio Boss Meme Posts", value: 31000000, unit: "posts" },
  { icon: "👀", title: "Gyatt Comments", value: 67000000, unit: "comments" },
  { icon: "✨", title: "Aura Farming Likes", value: 39000000, unit: "likes" },
  { icon: "💪", title: "Sigma Reddit Karma", value: 2700000, unit: "karma" },
  { icon: "🧸", title: "Skibidi Toy Sales", value: 14000000, unit: "units sold" },
  { icon: "🎨", title: "Skibidi Fan Art", value: 19000000, unit: "posts" },
  { icon: "👮", title: "Skibidi Sheriff Views", value: 38000000, unit: "views" },
  { icon: "🚽", title: "Skibidi Rizz Compilations", value: 52000000, unit: "views" },
  { icon: "🚽", title: "Skibidi Toilet Song Streams", value: 61000000, unit: "streams" },
  { icon: "🚽", title: "Skibidi Toilet Emoji Sends", value: 72000000, unit: "sends" },
  { icon: "🚽", title: "Skibidi vs Cameraman Edits", value: 28000000, unit: "edits" },
  { icon: "🚽", title: "Skibidi Toilet GIF Searches", value: 9300000, unit: "searches" },
  { icon: "🧠", title: "Mewing Tutorial Views", value: 15000000, unit: "views" },
  { icon: "🤳", title: "Mewing Before/After Pics", value: 5400000, unit: "pics" },
  { icon: "🤳", title: "Mewing Routine Downloads", value: 3100000, unit: "downloads" },
  { icon: "🧠", title: "Looksmaxxing Guide Reads", value: 7700000, unit: "reads" },
  { icon: "😎", title: "Rizz App Downloads", value: 6200000, unit: "downloads" },
  { icon: "😎", title: "Rizz Tutorial Views", value: 24000000, unit: "views" },
  { icon: "😎", title: "Rizz Compilation Likes", value: 48000000, unit: "likes" },
  { icon: "😎", title: "Rizz Fails TikToks", value: 19000000, unit: "tiktoks" },
  { icon: "🤫", title: "Ohio Rizz Emoji Uses", value: 51000000, unit: "uses" },
  { icon: "🤫", title: "Rizz Emoji Keyboard Sends", value: 88000000, unit: "sends" },
  { icon: "💪", title: "Sigma Male Quotes", value: 16000000, unit: "quotes" },
  { icon: "💪", title: "Sigma Grindset Posts", value: 12000000, unit: "posts" },
  { icon: "💪", title: "Sigma Shorts", value: 21000000, unit: "shorts" },
  { icon: "💪", title: "Sigma Audio Memes", value: 34000000, unit: "memes" },
  { icon: "🎙️", title: "Sigma Podcast Downloads", value: 8900000, unit: "downloads" },
  { icon: "📈", title: "Aura Farming Videos", value: 33000000, unit: "videos" },
  { icon: "⭐", title: "Aura Points Earned", value: 9900000, unit: "points" },
  { icon: "✨", title: "Aura Boost Hashtag Uses", value: 23000000, unit: "uses" },
  { icon: "💸", title: "Fanum Tax Reposts", value: 22000000, unit: "reposts" },
  { icon: "🍔", title: "Fanum Tax Videos", value: 27000000, unit: "videos" },
  { icon: "🍔", title: "Fanum Tax Meme Edits", value: 14000000, unit: "edits" },
  { icon: "🍔", title: "Fanum Tax Sound Uses", value: 36000000, unit: "uses" },
  { icon: "👀", title: "Gyatt Hashtag Uses", value: 58000000, unit: "uses" },
  { icon: "👀", title: "Gyatt Compilation Views", value: 44000000, unit: "views" },
  { icon: "👀", title: "Gyatt Sound TikToks", value: 25000000, unit: "tiktoks" },
  { icon: "👑", title: "Ohio Baddie Captions", value: 18000000, unit: "captions" },
  { icon: "👑", title: "Ohio Final Boss Sounds", value: 13000000, unit: "sounds" },
  { icon: "👑", title: "Ohio Fanum Tax Videos", value: 27000000, unit: "videos" },
  { icon: "👹", title: "Ohio Skibidi Dances", value: 19000000, unit: "videos" },
  { icon: "💅", title: "Ohio Rizz Tutorials", value: 11000000, unit: "tutorials" },
  { icon: "🗣️", title: "Hawk Tuah Searches", value: 28000000, unit: "searches" },
  { icon: "🦅", title: "Hawk Tuah Spit Compilation Views", value: 33000000, unit: "views" },
  { icon: "🪙", title: "Hawk Tuah Coin Mentions", value: 980000, unit: "mentions" },
  { icon: "🦅", title: "Hawk Tuah Song Streams", value: 41000000, unit: "streams" },
  { icon: "🥁", title: "Tung Tung Mentions", value: 9500000, unit: "mentions" },
  { icon: "🥁", title: "Tung Tung Edits", value: 17000000, unit: "edits" },
  { icon: "🎵", title: "Italian Brainrot Tags", value: 12000000, unit: "hashtags" },
  { icon: "🍝", title: "Italian Brainrot Views", value: 110000000, unit: "views" },
  { icon: "🍝", title: "Tralalero Tralala Memes", value: 26000000, unit: "memes" },
  { icon: "🦈", title: "Ballerina Cappuccina Posts", value: 18000000, unit: "posts" },
  { icon: "🦐", title: "Brr Brr Patapim Sounds", value: 15000000, unit: "sounds" },
  { icon: "🐘", title: "Bombardiro Crocodilo Edits", value: 21000000, unit: "edits" },
  { icon: "🤖", title: "NPC Chat Messages", value: 41000000, unit: "messages" },
  { icon: "🤖", title: "NPC Streaming Clips", value: 19000000, unit: "clips" },
  { icon: "🤖", title: "NPC Meme Generator Uses", value: 8700000, unit: "uses" },
  { icon: "🍦", title: "Grimace Shake Searches", value: 840000, unit: "searches" },
  { icon: "🍦", title: "Grimace Shake TikToks", value: 22000000, unit: "tiktoks" },
  { icon: "🍗", title: "Bussin Clips", value: 16000000, unit: "clips" },
  { icon: "😇", title: "Based Godfather Memes", value: 8700000, unit: "memes" },
  { icon: "⚽", title: "Ball Knowing Ball", value: 24000000, unit: "tiktoks" },
  { icon: "😭", title: "Me When I Wake Up", value: 44000000, unit: "memes" },
  { icon: "🚂", title: "Choo Choo Captions", value: 7600000, unit: "captions" },
  { icon: "🎧", title: "Phonk Playlist Adds", value: 29000000, unit: "adds" },
  { icon: "📲", title: "Rizz Keyboard Installs", value: 4800000, unit: "installs" },
  { icon: "👀", title: "No Cap Comment Uses", value: 63000000, unit: "uses" },
  { icon: "🔥", title: "It Is What It Is Memes", value: 35000000, unit: "memes" },
  { icon: "💀", title: "RIP Bozo Memes", value: 29000000, unit: "memes" },
  { icon: "🤡", title: "Clown Makeup Tutorials", value: 9500000, unit: "tutorials" },
  { icon: "🐐", title: "The GOAT Edits", value: 41000000, unit: "edits" },
  { icon: "😤", title: "Let Him Cook Clips", value: 18000000, unit: "clips" },
  { icon: "🧢", title: "Rent Free Brainrot", value: 22000000, unit: "posts" },
  { icon: "🌊", title: "Skull Emoji Comments", value: 77000000, unit: "comments" },
  { icon: "📉", title: "Ratio Meme Uses", value: 19000000, unit: "uses" },
  { icon: "🤝", title: "Side Eye Emoji Sends", value: 54000000, unit: "sends" },
  { icon: "🫠", title: "Melting Face Emoji", value: 46000000, unit: "uses" },
  { icon: "🗿", title: "Moai Statues Memes", value: 12000000, unit: "memes" },
  { icon: "🍆", title: "Eggplant Emoji Misuse", value: 83000000, unit: "sends" },
  { icon: "🍑", title: "Peach Emoji Sends", value: 61000000, unit: "sends" },
  { icon: "💅", title: "Nailed It Comments", value: 33000000, unit: "comments" },
  { icon: "🎯", title: "Sheesh Sound Uses", value: 72000000, unit: "uses" },
  { icon: "🗣️", title: "Bussin Sound TikToks", value: 38000000, unit: "tiktoks" },
  { icon: "👁️", title: "Ick Comment Replies", value: 26000000, unit: "replies" },
  { icon: "🥶", title: "It Is What It Is Hashtag", value: 31000000, unit: "uses" },
  { icon: "🫡", title: "Salute Emoji Comments", value: 44000000, unit: "comments" },
  { icon: "🤌", title: "Pinched Fingers Emoji", value: 57000000, unit: "uses" },
  { icon: "🧢", title: "No Shot Comment Uses", value: 25000000, unit: "uses" },
  { icon: "📱", title: "Phone Down Edit Views", value: 20000000, unit: "views" },
  { icon: "🔊", title: "Speaker Phone Audio", value: 16000000, unit: "audios" },
  // ---- TikTok viral phrases & slang ----
  { icon: "✨", title: "It Is Giving Hashtag Uses", value: 49000000, unit: "uses" },
  { icon: "💅", title: "Slay Hashtag Posts", value: 67000000, unit: "posts" },
  { icon: "🍽️", title: "Ate Hashtag TikToks", value: 42000000, unit: "tiktoks" },
  { icon: "🧢", title: "Vibe Check Videos", value: 29000000, unit: "videos" },
  { icon: "🎬", title: "Main Character Edits", value: 35000000, unit: "edits" },
  { icon: "💀", title: "Bet Phrase Comments", value: 61000000, unit: "comments" },
  { icon: "🔥", title: "No Cap Hashtag Uses", value: 55000000, unit: "uses" },
  { icon: "🤝", title: "Say Less Sound Uses", value: 27000000, unit: "uses" },
  { icon: "📈", title: "Locked In Clips", value: 19000000, unit: "clips" },
  { icon: "😤", title: "We Outside Memes", value: 24000000, unit: "memes" },
  { icon: "🫠", title: "Caught in 4K Posts", value: 33000000, unit: "posts" },
  { icon: "📱", title: "Phone a Friend Sound", value: 41000000, unit: "uses" },
  { icon: "🤡", title: "Clown Hashtag Posts", value: 22000000, unit: "posts" },
  { icon: "🐐", title: "The GOAT Sound Uses", value: 38000000, unit: "uses" },
  { icon: "🧠", title: "Big Brain Comments", value: 29000000, unit: "comments" },
  { icon: "💀", title: "Deadass Hashtag Uses", value: 26000000, unit: "uses" },
  { icon: "🤷", title: "Ick Hashtag Posts", value: 18000000, unit: "posts" },
  { icon: "👀", title: "Periodt Comment Uses", value: 31000000, unit: "uses" },
  { icon: "🫡", title: "Sir Comment Replies", value: 14000000, unit: "replies" },
  { icon: "😤", title: "Understood the Assignment", value: 27000000, unit: "posts" },
  { icon: "💅", title: "Nailed It Sound Uses", value: 23000000, unit: "uses" },
  { icon: "🎯", title: "Sheesh Sound Mentions", value: 45000000, unit: "mentions" },
  { icon: "🚨", title: "Red Flag Posts", value: 19000000, unit: "posts" },
  { icon: "🟢", title: "Green Flag Comments", value: 16000000, unit: "comments" },
  { icon: "🤡", title: "Clown Behavior TikToks", value: 33000000, unit: "tiktoks" },
  { icon: "👑", title: "Queen Behavior Posts", value: 21000000, unit: "posts" },
  { icon: "🧢", title: "Peasant Posts Memes", value: 12000000, unit: "memes" },
  { icon: "🧠", title: "NPC Hashtag Uses", value: 36000000, unit: "uses" },
  { icon: "🤖", title: "Robot TikTok Filters", value: 14000000, unit: "filters" },
  { icon: "🔥", title: "Hits Different Sound", value: 44000000, unit: "uses" },
  { icon: "💔", title: "Tears of Joy Clips", value: 25000000, unit: "clips" },
  { icon: "😭", title: "Sadge Comment Uses", value: 13000000, unit: "uses" },
  { icon: "🫣", title: "Peeking Emoji Sends", value: 47000000, unit: "sends" },
  { icon: "🤭", title: "Snickering Emoji Uses", value: 39000000, unit: "uses" },
  { icon: "🫶", title: "Heart Hands Comments", value: 28000000, unit: "comments" },
  { icon: "🤲", title: "Pleading Face Replies", value: 11000000, unit: "replies" },
  { icon: "🤌", title: "Italian Hand Emoji", value: 62000000, unit: "uses" },
  { icon: "🫵", title: "Index Pointing Emoji", value: 54000000, unit: "uses" },
  { icon: "👉", title: "Backhand Index Emoji", value: 76000000, unit: "uses" },
  { icon: "👈", title: "Point Left Emoji Sends", value: 41000000, unit: "sends" },
  { icon: "👇", title: "Point Down Emoji", value: 59000000, unit: "uses" },
  { icon: "☝️", title: "Index Up Emoji Uses", value: 33000000, unit: "uses" },
  { icon: "🤙", title: "Call Me Hand Emoji", value: 37000000, unit: "uses" },
  { icon: "🫰", title: "Money Hand Emoji", value: 48000000, unit: "uses" },
  { icon: "🫶", title: "Heart Hands Emoji Sends", value: 35000000, unit: "sends" },
  { icon: "🤝", title: "Handshake Emoji Replies", value: 26000000, unit: "replies" },
  { icon: "🙏", title: "Folded Hands Comments", value: 31000000, unit: "comments" },
  { icon: "💀", title: "Skull Emoji Replies", value: 82000000, unit: "replies" },
  { icon: "😂", title: "Laugh Cry Emoji", value: 91000000, unit: "uses" },
  { icon: "🤣", title: "ROFL Emoji Sends", value: 87000000, unit: "sends" },
  { icon: "😮", title: "Mind Blown Emoji", value: 44000000, unit: "uses" },
  { icon: "🤯", title: "Exploding Head Emoji", value: 39000000, unit: "uses" },
  { icon: "🥺", title: "Pleading Face Emoji", value: 67000000, unit: "uses" },
  { icon: "😎", title: "Smiling Face Emoji", value: 78000000, unit: "uses" },
  { icon: "🥳", title: "Party Face Emoji", value: 29000000, unit: "uses" },
  { icon: "😴", title: "Sleeping Face Emoji", value: 24000000, unit: "uses" },
  { icon: "🤤", title: "Drooling Face Emoji", value: 33000000, unit: "uses" },
  { icon: "😈", title: "Smiling Devil Emoji", value: 46000000, unit: "uses" },
  { icon: "👻", title: "Ghost Emoji Comments", value: 19000000, unit: "comments" },
  { icon: "💀", title: "Dead Meme Sound Uses", value: 31000000, unit: "uses" },
  { icon: "🎤", title: "Microphone Sound Trends", value: 22000000, unit: "trends" },
  { icon: "📞", title: "Phone Call Sound Uses", value: 26000000, unit: "uses" },
  { icon: "🚪", title: "Door Slam Sound Uses", value: 18000000, unit: "uses" },
  { icon: "🔔", title: "Notification Sound Uses", value: 21000000, unit: "uses" },
  { icon: "💬", title: "Text Message Sound Uses", value: 24000000, unit: "uses" },
  { icon: "🎵", title: "Viral Song Snippets", value: 58000000, unit: "snippets" },
  { icon: "🎧", title: "Phonk Edit Streams", value: 19000000, unit: "streams" },
  { icon: "🎹", title: "Lo-Fi Study Streams", value: 34000000, unit: "streams" },
  { icon: "🥁", title: "Drum Cover Videos", value: 16000000, unit: "videos" },
  { icon: "🎸", title: "Guitar Cover TikToks", value: 28000000, unit: "tiktoks" },
  { icon: "🎤", title: "Singing Challenge Posts", value: 23000000, unit: "posts" },
  { icon: "🕺", title: "Dance Challenge Videos", value: 47000000, unit: "videos" },
  { icon: "💃", title: "Shuffle Dance Posts", value: 38000000, unit: "posts" },
  { icon: "🤸", title: "Trick Shot Videos", value: 29000000, unit: "videos" },
  { icon: "🏀", title: "Basketball Trick Clips", value: 21000000, unit: "clips" },
  { icon: "⚽", title: "Freestyle Soccer Posts", value: 26000000, unit: "posts" },
  { icon: "🏈", title: "Football Highlight Edits", value: 17000000, unit: "edits" },
  { icon: "🎮", title: "Gaming Highlight Clips", value: 44000000, unit: "clips" },
  { icon: "🎯", title: "Aim Trainer Videos", value: 15000000, unit: "videos" },
  { icon: "🔥", title: "Clutch Moment Edits", value: 33000000, unit: "edits" },
  { icon: "🏆", title: "Victory Royale Clips", value: 39000000, unit: "clips" },
  { icon: "💀", title: "Fail Compilation Views", value: 52000000, unit: "views" },
  { icon: "😂", title: "Funny Animal TikToks", value: 61000000, unit: "tiktoks" },
  { icon: "🐱", title: "Cat Video Views", value: 73000000, unit: "views" },
  { icon: "🐶", title: "Dog Video Views", value: 68000000, unit: "views" },
  { icon: "🦁", title: "Lion TikTok Videos", value: 24000000, unit: "videos" },
  { icon: "🦒", title: "Giraffe TikTok Views", value: 31000000, unit: "views" },
  { icon: "🐢", title: "Turtle Slow Motion", value: 19000000, unit: "videos" },
  { icon: "🦆", title: "Duck Walk Videos", value: 14000000, unit: "videos" },
  { icon: "🐧", title: "Penguin Waddle Posts", value: 22000000, unit: "posts" },
  { icon: "🦖", title: "Dinosaur Meme Uses", value: 17000000, unit: "uses" },
  { icon: "🥑", title: "Avocado Meme Posts", value: 12000000, unit: "posts" },
  { icon: "🍕", title: "Pizza TikTok Views", value: 46000000, unit: "views" },
  { icon: "🍔", title: "Burger ASMR Videos", value: 38000000, unit: "videos" },
  { icon: "🍜", title: "Ramen ASMR Views", value: 33000000, unit: "views" },
  { icon: "🍦", title: "Ice Cream ASMR", value: 29000000, unit: "videos" },
  { icon: "☕", title: "Coffee TikTok Views", value: 35000000, unit: "views" },
  { icon: "🍵", title: "Tea Ceremony Clips", value: 18000000, unit: "clips" },
  { icon: "🧋", title: "Boba Tea TikToks", value: 41000000, unit: "tiktoks" },
  { icon: "🥤", title: "Smoothie Bowl Posts", value: 24000000, unit: "posts" },
  { icon: "🍩", title: "Donut ASMR Videos", value: 27000000, unit: "videos" },
  { icon: "🍪", title: "Cookie Decorating Clips", value: 19000000, unit: "clips" },
  { icon: "🎂", title: "Cake Decorating Views", value: 32000000, unit: "views" },
  { icon: "🍰", title: "Dessert Recipe TikToks", value: 28000000, unit: "tiktoks" },
  { icon: "🍫", title: "Chocolate Making ASMR", value: 26000000, unit: "videos" },
  { icon: "🍬", title: "Candy ASMR Channels", value: 22000000, unit: "channels" },
  // ---- wider pop-culture stats & memes ----
  { icon: "🟦", title: "Among Us Crewmate Memes", value: 19000000, unit: "memes" },
  { icon: "🔴", title: "Impostor Soundboard Uses", value: 14000000, unit: "uses" },
  { icon: "🧍", title: "NPC Streaming Hours", value: 1200000, unit: "hours" },
  { icon: "🎃", title: "Spooky Season Posts", value: 41000000, unit: "posts" },
  { icon: "🎄", title: "Christmas TikTok Views", value: 88000000, unit: "views" },
  { icon: "🎃", title: "Halloween Costume TikToks", value: 52000000, unit: "tiktoks" },
  { icon: "🦃", title: "Thanksgiving Memes", value: 28000000, unit: "memes" },
  { icon: "💝", title: "Valentine Memes", value: 35000000, unit: "memes" },
  { icon: "🧧", title: "Lunar New Year Clips", value: 21000000, unit: "clips" },
  { icon: "🥂", title: "New Year Firework Posts", value: 47000000, unit: "posts" },
  { icon: "🌈", title: "Pride Month Posts", value: 38000000, unit: "posts" },
  { icon: "🍀", title: "St Patrick Memes", value: 16000000, unit: "memes" },
  { icon: "🐰", title: "Easter Bunny Clips", value: 18000000, unit: "clips" },
  { icon: "🎆", title: "Fourth of July Posts", value: 29000000, unit: "posts" },
  { icon: "🎇", title: "Diwali TikTok Views", value: 24000000, unit: "views" },
  { icon: "🕎", title: "Hanukkah Clips", value: 9000000, unit: "clips" },
  { icon: "🪔", title: "Diya Craft Videos", value: 11000000, unit: "videos" },
  { icon: "🎪", title: "Carnival Ride Posts", value: 14000000, unit: "posts" },
  { icon: "🎢", title: "Roller Coaster POV", value: 26000000, unit: "videos" },
  { icon: "🎡", title: "Ferris Wheel Timelapses", value: 8000000, unit: "timelapses" },
  { icon: "🏖️", title: "Beach Vacation Vlogs", value: 33000000, unit: "vlogs" },
  { icon: "⛱️", title: "Pool Party TikToks", value: 27000000, unit: "tiktoks" },
  { icon: "🏔️", title: "Mountain Hike Clips", value: 19000000, unit: "clips" },
  { icon: "🌋", title: "Volcano Eruption Videos", value: 36000000, unit: "videos" },
  { icon: "🌊", title: "Ocean Wave TikToks", value: 22000000, unit: "tiktoks" },
  { icon: "🦈", title: "Shark Encounter Clips", value: 41000000, unit: "clips" },
  { icon: "🐋", title: "Whale Watch Vlogs", value: 18000000, unit: "vlogs" },
  { icon: "🦋", title: "Butterfly Timelapses", value: 15000000, unit: "timelapses" },
  { icon: "🌻", title: "Sunflower Field Vlogs", value: 12000000, unit: "vlogs" },
  { icon: "🌸", title: "Cherry Blossom Posts", value: 24000000, unit: "posts" },
  { icon: "🍁", title: "Fall Foliage Clips", value: 16000000, unit: "clips" },
  { icon: "❄️", title: "Snow Day TikToks", value: 29000000, unit: "tiktoks" },
  { icon: "🌨️", title: "Blizzard Rescue Videos", value: 20000000, unit: "videos" },
  { icon: "🌪️", title: "Tornado Chase Clips", value: 17000000, unit: "clips" },
  { icon: "🌈", title: "Rainbow Hunting Videos", value: 14000000, unit: "videos" },
  { icon: "☀️", title: "Golden Hour Timelapses", value: 31000000, unit: "timelapses" },
  { icon: "🌙", title: "Full Moon Timelapses", value: 22000000, unit: "timelapses" },
  { icon: "⭐", title: "Northern Lights Clips", value: 27000000, unit: "clips" },
  { icon: "🚀", title: "Rocket Launch Views", value: 48000000, unit: "views" },
  { icon: "🛸", title: "UFO Sightings Posts", value: 19000000, unit: "posts" },
  { icon: "👽", title: "Alien TikTok Memes", value: 23000000, unit: "memes" },
  { icon: "🪐", title: "Planet TikTok Edits", value: 17000000, unit: "edits" },
  { icon: "🌌", title: "Galaxy Timelapse Videos", value: 26000000, unit: "videos" },
  { icon: "☄️", title: "Meteor Shower Clips", value: 13000000, unit: "clips" },
  { icon: "🔭", title: "Telescope TikTok Views", value: 11000000, unit: "views" },
  { icon: "🧪", title: "Science Experiment TikToks", value: 39000000, unit: "tiktoks" },
  { icon: "⚗️", title: "Slime Making Videos", value: 34000000, unit: "videos" },
  { icon: "🧬", title: "DNA Model Crafts", value: 8000000, unit: "crafts" },
  { icon: "🔬", title: "Microscope TikTok Views", value: 12000000, unit: "views" },
  { icon: "💎", title: "Crystal Growing Videos", value: 16000000, unit: "videos" },
  { icon: "🧲", title: "Magnet Science Clips", value: 9000000, unit: "clips" },
  { icon: "⚡", title: "Lightning Storm Videos", value: 44000000, unit: "videos" },
  { icon: "🔥", title: "Fire Performance Clips", value: 23000000, unit: "clips" },
  { icon: "🎇", title: "Fireworks TikToks", value: 38000000, unit: "tiktoks" },
  { icon: "🎆", title: "Fourth of July Fireworks", value: 29000000, unit: "videos" },
  { icon: "🎈", title: "Balloon Pop Videos", value: 18000000, unit: "videos" },
  { icon: "🎉", title: "Party Popper Clips", value: 14000000, unit: "clips" },
  { icon: "🎊", title: "Confetti Burst Videos", value: 16000000, unit: "videos" },
  { icon: "🎁", title: "Gift Wrapping Timelapses", value: 11000000, unit: "timelapses" },
  { icon: "🎄", title: "Christmas Decorating", value: 33000000, unit: "videos" },
  { icon: "🎅", title: "Santa TikTok Cameos", value: 27000000, unit: "cameos" },
  { icon: "🤶", title: "Mrs Claus Memes", value: 8000000, unit: "memes" },
  { icon: "🧑‍🎄", title: "Elf on the Shelf Posts", value: 19000000, unit: "posts" },
  { icon: "🎁", title: "Secret Santa TikToks", value: 15000000, unit: "tiktoks" },
  { icon: "🦌", title: "Reindeer Pet Videos", value: 12000000, unit: "videos" },
  { icon: "🐻", title: "Polar Bear Cam Views", value: 34000000, unit: "views" },
  { icon: "🧊", title: "Ice Hotel Vlogs", value: 10000000, unit: "vlogs" },
  { icon: "🏔️", title: "Ski Resort TikToks", value: 22000000, unit: "tiktoks" },
  { icon: "🏂", title: "Snowboard Trick Clips", value: 24000000, unit: "clips" },
  { icon: "⛷️", title: "Ski Jump Videos", value: 13000000, unit: "videos" },
  { icon: "🛷", title: "Sledding Hill Videos", value: 9000000, unit: "videos" },
  { icon: "🛝", title: "Water Slide POV", value: 17000000, unit: "videos" },
  { icon: "🎠", title: "Carousel TikTok Trends", value: 11000000, unit: "trends" },
  { icon: "🎪", title: "Circus TikTok Videos", value: 14000000, unit: "videos" },
  { icon: "🤹", title: "Juggling TikTok Clips", value: 8000000, unit: "clips" },
  { icon: "🎭", title: "Mask Try-On TikToks", value: 19000000, unit: "tiktoks" },
  { icon: "🎨", title: "Face Paint Timelapses", value: 15000000, unit: "timelapses" },
  { icon: "💄", title: "Makeup Transformation Posts", value: 42000000, unit: "posts" },
  { icon: "💇", title: "Hairstyle Tutorial Views", value: 38000000, unit: "views" },
  { icon: "✂️", title: "Barber TikTok Videos", value: 26000000, unit: "videos" },
  { icon: "🪒", title: "Shave Transformation Clips", value: 14000000, unit: "clips" },
  { icon: "💅", title: "Nail Art Timelapses", value: 17000000, unit: "timelapses" },
  { icon: "🎺", title: "Trumpet TikTok Videos", value: 8000000, unit: "videos" },
  { icon: "🪗", title: "Accordion TikToks", value: 6000000, unit: "tiktoks" },
  { icon: "🪕", title: "Banjo TikTok Videos", value: 7000000, unit: "videos" },
  { icon: "🎸", title: "Guitar Lesson TikToks", value: 22000000, unit: "tiktoks" },
  { icon: "🪕", title: "Ukulele Tutorial Views", value: 14000000, unit: "views" },
  { icon: "🎻", title: "Cello TikTok Videos", value: 8000000, unit: "videos" },
  { icon: "🥁", title: "Drum Machine TikToks", value: 19000000, unit: "tiktoks" },
  { icon: "🎧", title: "Headphone Review Videos", value: 24000000, unit: "videos" },
  { icon: "🔊", title: "Speaker Comparison Clips", value: 11000000, unit: "clips" },
  { icon: "📱", title: "Phone Unboxing Videos", value: 28000000, unit: "videos" },
  { icon: "💻", title: "Laptop Review TikToks", value: 19000000, unit: "tiktoks" },
  { icon: "⌨️", title: "Keyboard ASMR Videos", value: 16000000, unit: "videos" },
  { icon: "🖱️", title: "Mouse Click ASMR", value: 8000000, unit: "videos" },
  { icon: "🖥️", title: "Monitor Setup TikToks", value: 13000000, unit: "tiktoks" },
  { icon: "🖨️", title: "3D Printer TikToks", value: 17000000, unit: "tiktoks" },
  { icon: "🔧", title: "Tool Review Videos", value: 14000000, unit: "videos" },
  { icon: "🔨", title: "Hammer Trick Videos", value: 11000000, unit: "videos" },
  { icon: "🪛", title: "Screwdriver ASMR", value: 7000000, unit: "videos" },
  { icon: "⚙️", title: "Gear Ratio TikToks", value: 5000000, unit: "tiktoks" },
  { icon: "🔩", title: "Bolt Sorting ASMR", value: 9000000, unit: "videos" },
];

/* ---- localStorage helpers ---- */
const LS_STREAK = "high_score_streak";
const LS_STREAK_OLD = "brainrot_grid_highest_streak";
const LS_GAMES = "brainrot_grid_games_played";
const LS_ROUNDS = "brainrot_grid_rounds_played";

function getBestStreak() {
  let v = localStorage.getItem(LS_STREAK);
  if (v === null) {
    // migrate legacy key once
    v = localStorage.getItem(LS_STREAK_OLD) || "0";
    localStorage.setItem(LS_STREAK, v);
  }
  return parseInt(v, 10) || 0;
}
function setBestStreak(v) {
  localStorage.setItem(LS_STREAK, String(v));
}
function formatScore(n) {
  return n.toLocaleString("en-US");
}

/* ---- sound effects (tiny WebAudio blips) ---- */
let audioCtx = null;
function blip(freq, dur, type = "square", vol = 0.06) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio unsupported — fine */ }
}

/* ============================================================
   GAME PAGE
   ============================================================ */
function initGame() {
  const arena = document.getElementById("arena");
  if (!arena) return;

  const leftCard = document.getElementById("card-left");
  const rightCard = document.getElementById("card-right");
  const streakEl = document.getElementById("streak-value");
  const bestEl = document.getElementById("best-value");
  const feedbackEl = document.getElementById("feedback");
  const gameOverEl = document.getElementById("game-over");
  const finalStreakEl = document.getElementById("final-streak");
  const playAgainBtn = document.getElementById("play-again");
  const restartBtn = document.getElementById("restart-game");

  let streak = 0;
  let locked = false;
  let currentLeft = null;
  let currentRight = null;
  let usedIndexes = new Set();

  function pickTwo() {
    // reset pool when nearly exhausted
    if (usedIndexes.size >= brainrotDatabase.length - 2) usedIndexes.clear();
    let i, j;
    do { i = Math.floor(Math.random() * brainrotDatabase.length); } while (usedIndexes.has(i));
    do { j = Math.floor(Math.random() * brainrotDatabase.length); } while (j === i || usedIndexes.has(j));
    usedIndexes.add(i).add(j);
    return [brainrotDatabase[i], brainrotDatabase[j]];
  }

  function renderCard(card, metric, isHidden) {
    card.querySelector(".big-emoji").textContent = metric.icon;
    card.querySelector(".topic").textContent = metric.title;
    const base = card.querySelector(".metric-base");
    const reveal = card.querySelector(".metric-reveal");
    base.style.display = "";
    reveal.style.display = "none";
    if (isHidden) {
      base.textContent = "???";
    } else {
      base.innerHTML = `${formatScore(metric.value)} <span class="unit">${metric.unit}</span>`;
    }
    card.classList.remove("correct", "wrong");
  }

  function nextRound() {
    [currentLeft, currentRight] = pickTwo();
    renderCard(leftCard, currentLeft, false);
    renderCard(rightCard, currentRight, true);
    leftCard.classList.remove("card-slide-in-left");
    rightCard.classList.remove("card-slide-in-right");
    void leftCard.offsetWidth; void rightCard.offsetWidth;
    leftCard.classList.add("card-slide-in-left");
    rightCard.classList.add("card-slide-in-right");
  }

  function updateStreakUI() {
    streakEl.textContent = streak;
    streakEl.parentElement.classList.toggle("streak-hot", streak >= 5);
    bestEl.textContent = getBestStreak();
  }

  function endGame() {
    locked = true;
    if (streak > getBestStreak()) setBestStreak(streak);
    localStorage.setItem(LS_GAMES, String((parseInt(localStorage.getItem(LS_GAMES) || "0", 10)) + 1));
    finalStreakEl.textContent = streak;
    gameOverEl.classList.add("show");
    feedbackEl.textContent = "";
    blip(160, 0.5, "sawtooth", 0.05);
  }

  function guess(choice) { // 'higher' | 'lower'
    if (locked || !currentLeft || !currentRight) return;
    locked = true;
    localStorage.setItem(LS_ROUNDS, String((parseInt(localStorage.getItem(LS_ROUNDS) || "0", 10)) + 1));

    const isHigher = currentRight.value > currentLeft.value;
    const correct = (choice === "higher" && isHigher) || (choice === "lower" && !isHigher);

    // reveal the hidden value
    const reveal = rightCard.querySelector(".metric-reveal");
    rightCard.querySelector(".metric-base").style.display = "none";
    reveal.style.display = "block";
    reveal.innerHTML = `${formatScore(currentRight.value)} <span class="unit">${currentRight.unit}</span>`;

    const resultClass = correct ? "correct" : "wrong";
    leftCard.classList.add(resultClass);
    rightCard.classList.add(resultClass);

    if (correct) {
      streak++;
      if (streak > getBestStreak()) setBestStreak(streak);
      feedbackEl.textContent = "🔥 Correct! +1 streak";
      feedbackEl.className = "feedback good";
      blip(660, 0.12);
      setTimeout(() => blip(880, 0.18), 110);
    } else {
      feedbackEl.textContent = `💀 Wrong! It was ${isHigher ? "HIGHER" : "LOWER"} — streak over.`;
      feedbackEl.className = "feedback bad";
      blip(180, 0.4, "sawtooth", 0.07);
    }
    updateStreakUI();

    setTimeout(() => {
      if (!correct) { endGame(); return; }
      leftCard.classList.add("card-slide-out-left");
      rightCard.classList.add("card-slide-out-right");
      setTimeout(() => {
        leftCard.classList.remove("card-slide-out-left", "correct");
        rightCard.classList.remove("card-slide-out-right", "correct");
        gameOverEl.classList.remove("show");
        feedbackEl.textContent = "";
        nextRound();
        locked = false;
      }, 450);
    }, 900);
  }

  document.querySelectorAll(".guess-btn").forEach(btn => {
    btn.addEventListener("click", () => guess(btn.dataset.choice));
  });

  function restart() {
    streak = 0;
    locked = false;
    gameOverEl.classList.remove("show");
    feedbackEl.textContent = "";
    leftCard.classList.remove("card-slide-in-left", "correct", "wrong");
    rightCard.classList.remove("card-slide-in-right", "correct", "wrong");
    updateStreakUI();
    nextRound();
  }
  if (playAgainBtn) playAgainBtn.addEventListener("click", restart);
  if (restartBtn) restartBtn.addEventListener("click", restart);

  updateStreakUI();
  nextRound();
}

/* ---- boot ---- */
document.addEventListener("DOMContentLoaded", initGame);
