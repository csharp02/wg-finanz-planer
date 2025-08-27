import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { getDatabase, get, child, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js'


const firebaseConfig = {
    databaseURL: "https://wg-finanz-planer-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getDatabase();


const counters = {
    Cristi: 0,
    Jan: 0,
    Michal: 0
};


// Read counter values on page load
window.addEventListener('DOMContentLoaded', () => {
    const names = Object.keys(counters);
    names.forEach(name => {
        onValue(ref(db, 'counters/' + name), (snapshot) => {
            const data = snapshot.val();
            if(data !== null) {
                counters[name] = data["total"];
                document.getElementById(name.toLowerCase() + '-counter').innerText = data["total"] + "€";
            }
        })
    }); 
});

// Handle form submission
document.getElementById('input-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const value = parseFloat(document.getElementById('value').value);

    if (name && !isNaN(value)) {
        const newTotal = (counters[name] || 0) + value;
        console.log(counters[name]);
        counters[name] = newTotal;

        // Update local UI
        document.getElementById(name.toLowerCase() + '-counter').innerText = newTotal + "€";

        // Update Firebase
        //db.ref('counters/' + name).set(newTotal);

        set(ref(db, 'counters/' + name), {
            total: newTotal,
        });    
    }

    document.getElementById('value').value = '';
});