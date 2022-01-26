var mongoose = require('mongoose');
var Product = require('../model/product.js');

const COSMOSDB_USER = process.env.COSMOSDB_ACCOUNT_NAME;
const COSMOSDB_PASSWORD = process.env.COSMOSDB_PASSWORD;
const COSMOSDB_DBNAME = process.env.COSMOSDB_DATABASE_NAME;
const COSMOSDB_HOST = process.env.COSMOSDB_ACCOUNT_NAME + ".mongo.cosmos.azure.com";
const COSMOSDB_PORT = process.env.COSMOSDB_PORT;

// Connection built from Microsoft tutorial:  https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/connect-using-mongoose
mongoose.connect("mongodb://"+COSMOSDB_HOST+":"+COSMOSDB_PORT+"/"+COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
    auth: {
        username: COSMOSDB_USER,
        password: COSMOSDB_PASSWORD
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false
})
.then(() => {
    insertProducts();
})
.catch((err) => {
    console.error(err);
});

async function insertProducts() {
    var allProducts = [];

    // Inserting ProductID 1
    allProducts.push(
        new Product({
            productId: 1,
            brand: "Boss",
            name: "DS-1",
            type: "Distortion",
            description: "Simply put, the BOSS DS-1 distortion pedal is a modern classic. For the better part of 30 years, you've heard this orange box put through its paces on countless top rock recordings - from Kurt Cobain's \"Nevermind\"-era grunge to the renowned distorted tones of Steve Vai. The DS-1 is affordable, it's incredible sounding, and it's a rock pedalboard staple - the perfect first distortion stompbox and one that may well be your last. Whether you pair it with your guitar's single-coil or humbucking pickups, expect rich, dynamic-laden tone with the BOSS DS-1.",
            price: 59.99,
            image: "ds-1.jpg",
            video: "https://www.youtube.com/embed/OJHfMLnFQ9s"
        })
    );
    
    // Inserting ProductID 2
    allProducts.push(
        new Product({
            productId: 2,
            brand: "Boss",
            type: "Overdrive",
            name: "BD-2",
            description: "The BOSS BD-2 Blues Driver guitar effects pedal delivers that creamy yet crunchy sound you've heard countless great blues guitar players call up - and at a great value! The BD-2 Blues Driver simulates the sound of a vintage tube amplifier, giving you instant access to timeless tones. It also responds to your playing dynamics, so you can pull out a range of tones to give each note the perfect flavor and feel. All in all, you'll love the warm overdrive and emotive distortion the BOSS BD-2 Blues Driver adds to your rig.",
            price: 129.99,
            image: "bd-2.jpg",
            video: "https://www.youtube.com/embed/0mi5ILzTGks"
        })
    );
    
    // Inserting ProductID 3
    allProducts.push(
        new Product({
            productId: 3,
            brand: "Walrus Audio",
            name: "Polychrome",
            type: "Modulation",
            description: "Serving double duty as a traditional flanger and a vibrant vibrato effect, the Walrus Audio Polychrome effects pedal will add big creative potential to your pedalboard. A 2-way voicing switch offers two distinct flavors of flanging: a traditional, full-frequency effect; or a more complex, notched flange effect with less low end. And when you need a vibrato effect instead of flanging, simply turn the feedback down to minimum and turn the D-F-V knob all the way up. Complete with an all-analog signal path, a relay-based soft switch, and an ultra-rugged, die-cast metal construction, the Walrus Audio Polychrome pedal will exceed your sonic expectations.",
            price: 199.99,
            image: "polychrome.jpg",
            video: "https://www.youtube.com/embed/5LkZoOGGhjc"
        })
    );
    
    // Inserting ProductID 4
    allProducts.push(
        new Product({
            productId: 4,
            brand: "Walrus Audio",
            name: "Iron Horse",
            type: "Distortion",
            description: "The Walrus Audio Iron Horse V2 is your ticket to meaty, punchy distortion. Park this pedal in front of any amp, and things are guaranteed to get rowdy. A 3-way switch toggles between different clipping diodes, giving you a versatile array of tones. Beyond that, you get Level, Tone, and Distortion controls to shape your sound. With the Iron Horse, there's a flexible amount of gain on tap. This stompbox handles high-gain situations with ease, but back off the Distortion knob and it pulls double duty as a thick, warm overdrive. Complete with true-bypass switching, the Iron Horse V2 is perfect for any rock guitarist who's into chunky rhythms and blistering solos.",
            price: 174.99,
            image: "ironhorse.jpg",
            video: "https://www.youtube.com/embed/gyk7jqhUOgk"
        })
    );
    
    // Inserting ProductID 5
    allProducts.push(
        new Product({
            productId: 5,
            brand: "MXR",
            name: "Carbon Copy Deluxe",
            type: "Delay",
            description: "With the Carbon Copy Deluxe, MXR took their popular analog delay pedal and added a cluster of oft-requested features. First of all, the Deluxe extends its delay time up to 1.2s, and it maximizes every millisecond with tap tempo and a tap division feature. You can call up both the original Carbon Copy's darker tone or the vibrant articulation of the Bright version, and the Mod function's internal controls have been conveniently relocated to the top of the pedal. You also get an expression jack, programmable presets, and more. This is truly the ultimate Carbon Copy!",
            price: 229.99,
            image: "carboncopy.jpg",
            video: "https://www.youtube.com/embed/tAwmYauiHx0"
        })
    );
    
    // Inserting ProductID 6
    allProducts.push(
        new Product({
            productId: 6,
            brand: "TC Electronic",
            name: "Polytune 3",
            type: "Tuner",
            description: "The PolyTune 3 Noir Mini manages to pack all the pedal-tuning and tone-preserving power of TC's full-sized PolyTune 3 into a miniature pedal format. The TC Electronic PolyTune 3 Noir Mini is just as fast, dependable, and intuitive as ever, boasting accuracy within 0.02 cents and delivering a no-nonsense approach to guitar and instrument tuning. Strum all strings* to see which ones are out of tune at a glance, or tune up one string at a time. The PolyTune 3 Mini automatically switches between mono and poly modes based on the incoming signal. And thanks to its built-in, high-quality-analog BonaFide Buffer (switchable to true bypass), the PolyTune 3 Mini can even improve your tone over extended cable runs. This means you get a bite, presence, and transient response that's much closer to plugging directly into an amp. But that's not all that's cool about the TC PolyTune 3 Mini. Alternate tuning modes make it fast and easy to explore new ways to craft your art, even in the middle of a frantic set. And an improved auto-dimming, 109-LED display makes tuning more comfortable in any environment, indoors or out.",
            price: 99.99,
            image: "polytune.jpg",
            video: "https://www.youtube.com/embed/PcAxNzcgx4Y"
        })
    );
    
    // Inserting ProductID 7
    allProducts.push(
        new Product({
            productId: 7,
            brand: "JHS",
            name: "Bonsai",
            type: "Overdrive",
            description: "What the Muffuletta did for big fuzzes, the JHS Bonsai does for screaming green overdrives. Slap the Bonsai on your pedalboard and enjoy unhindered access to four decades' worth of pedals. There are nine different sonic textures to choose from. Want some classic mid-bump grind? It's in there. SRV-style dirty boost? Yep. Mayer-esque low-gain grit? You got it — and a whole lot more. The Bonsai isn't a modeler — it boasts the exact same components as the source units. So when you select a mode with the Bonsai's rotary control, your guitar signal actually passes through a replica of the original pedal's circuitry. With the Bonsai, you truly get nine overdrive pedals packed into one housing.",
            price: 134.99,
            image: "bonsai.jpg",
            video: "https://www.youtube.com/embed/0o54cfloQE4"
        })
    );
    
    // Inserting ProductID 8
    allProducts.push(
        new Product({
            productId: 8,
            brand: "Neunaber",
            name: "Immerse Mk II",
            type: "Reverb",
            description: "With richer reverbs and a Mix knob that goes 100% wet, the Immerse Mk II is our best-sounding reverberator to date. Delivering the same no-nonsense flexibility as its predecessor, it’s more user-friendly than ever before. Experience studio-quality tone in a pedal that can be used with instruments of all stripes. The Immerse Mk II is packed with eight versatile reverb effects, including the new W3T and Sustain effect.",
            price: 299.99,
            image: "immerse.jpg",
            video: "https://www.youtube.com/embed/SNER7haAbJU"
        })
    );
    
    // Inserting ProductID 9
    allProducts.push(
        new Product({
            productId: 9,
            brand: "EHX",
            name: "Small Clone",
            type: "Modulation",
            description: "You've heard the Small Clone. This is Kurt Cobain's chorus pedal of choice, responsible for the dimension in \"Come As You Are\" and countless other Nirvana tracks. The Small Clone's rich, spacey, and totally analog tones have kept it on the must-have stompbox list for more than 20 years now - and the second you engage this thing you'll hear why. You can take the Small Clone from a subtle shimmer to a pulsating warble to crazy Leslie-style effects. If you're after a chorus with real mood, real vibe... you've found it. The Small Clone.",
            price: 59.99,
            image: "smallclone.jpg",
            video: "https://www.youtube.com/embed/IBY3hEXeBCI"
        })
    );
    
    // Inserting ProductID 10
    allProducts.push(
        new Product({
            productId: 10,
            brand: "EHX",
            name: "Big Muff",
            type: "Fuzz",
            description: "The Electro-Harmonix Big Muff Pi is the pedal that started it all. The Big Muff Pi is the distortion pedal countless musicians, including Hendrix and Santana, relied on for its rich, creamy, violin-like sustain. A timeless piece, the Electro-Harmonix Big Muff Pi has been defining the sound of rock guitar for the past 30 years.",
            price: 90.80,
            image: "bigmuff.jpg",
            video: "https://www.youtube.com/embed/BwS5k7JdwCs"
        })
    );
    
    // Inserting ProductID 11
    allProducts.push(
        new Product({
            productId: 11,
            brand: "Wren and Cuff",
            name: "Super Russian",
            type: "Fuzz",
            description: "A separate crystal clear transparent germanium buffered boost section before the muff to push things even harder if needed. This buffered boost can also be used on its own as a beautiful clean tool to beef up your clean tone, or use it to push another pedal later down the chain. Even without the muff, you’ll find it hard to turn off the germanium goodness on tap.",
            price: 224.99,
            image: "superrussian.jpg",
            video: "https://www.youtube.com/embed/CFRN4eR0Les"
        })
    );
    
    // Inserting ProductID 12
    allProducts.push(
        new Product({
            productId: 12,
            brand: "Walrus Audio",
            name: "385",
            type: "Overdrive",
            description: "What do you get when you plug an electric guitar into a vintage film projector? Awesome tone. Many decades ago, adventurous guitarists in search of tonal nirvana found that the tube-driven audio section of that dusty old film projector in the attic made a fantastic guitar amp. This lore was not lost on the tone-chasers at Walrus Audio; and now we have the Walrus Audio 385, an overdrive pedal that models the tonal and drive characteristics of the tube audio circuit of a 1950s Bell and Howell 385 Filmosound projector. At Sweetwater, we love the Walrus Audio 385 — it's our kind of overdrive pedal. Dynamic, tubular, and amp-like, the 385 pedal is very responsive to your picking velocity and guitar's volume pot. Lean into it and up the grit; back off, and it cleans up nicely.",
            price: 189.99,
            image: "385.jpg",
            video: "https://www.youtube.com/embed/j0JvlWbeNGY"
        })
    );
    
    // Now that we've setup all our products, we can loop through them and save each one to our MongoDB instance
    allProducts.forEach(product => {
        product.save((err, savedProduct) => {
            console.log("Saved Product: " + savedProduct.name);
        });
    });

    // wait a bit for records to save
    sleep(10);

    while (true) {
        const query = await Product.find();
        console.log(query.length);

        if (query.length == allProducts.length) {
           process.exit();
        }
        else {
           sleep(2);
        }
    }
}

// Derived from https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(seconds) {
    var milliseconds = seconds * 1000;
    const start = Date.now();
    var now = null;
    let currentDate = null;

    do {
        now = Date.now();
    } while (now - start < milliseconds);
}