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

function addPurchaseItem(name, product, value) {

    console.log("Adding purchase item:", name, product, value);
    // Add to DOM
    const ul = document.getElementById('purchase-list');
    const li = document.createElement('li');
    li.style.marginBottom = '10px';
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.backgroundColor = '#fff';
    li.style.padding = '10px';
    li.style.borderRadius = '5px';
    li.innerHTML = `
        <div>
            <strong style="font-size: 18px;">${product}</strong><br>
            <small style="color: gray;">${name}</small>
        </div>
        <strong style="font-size: 18px;">${value.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}</strong>
    `;
    ul.insertBefore(li, ul.firstChild);

    // Add to Firebase (with a unique key)
    const purchasesRef = ref(db, 'purchases');
    const newPurchaseRef = ref(db, `purchases/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    set(newPurchaseRef, {
        name,
        product,
        value
    });
}


// Read counter values on page load
window.addEventListener('DOMContentLoaded', () => {
    const names = Object.keys(counters);
    names.forEach(name => {
        onValue(ref(db, 'counters/' + name), (snapshot) => {
            const data = snapshot.val();
            if (data !== null) {
                counters[name] = data["total"];
                document.getElementById(name.toLowerCase() + '-counter').innerText = data["total"] + "€";
            }
        })
    });
    const ul = document.getElementById('purchase-list');
    const purchasesRef = ref(db, 'purchases');

    onValue(purchasesRef, (snapshot) => {
        ul.innerHTML = ''; // Clear current list
        const data = snapshot.val();
        if (data) {

            Object.entries(data)
                .sort((a, b) => {
                    // Extract timestamp from key (before first underscore)
                    const tsA = parseInt(a[0].split('_')[0], 10);
                    const tsB = parseInt(b[0].split('_')[0], 10);
                    return tsB - tsA;
                })
                .forEach(([_, item]) => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '10px';
                    li.style.display = 'flex';
                    li.style.justifyContent = 'space-between';
                    li.style.alignItems = 'center';
                    li.style.backgroundColor = '#fff';
                    li.style.padding = '10px';
                    li.style.borderRadius = '5px';
                    li.innerHTML = `
                    <div>
                        <strong style="font-size: 18px;">${item.product}</strong><br>
                        <small style="color: gray;">${item.name}</small>
                    </div>
                    <strong style="font-size: 18px;">${item.value.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}</strong>
                `;
                    ul.appendChild(li);
                });
        }
    });

});

// Handle form submission
document.getElementById('input-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const value = parseFloat(document.getElementById('value').value);
    const product = document.getElementById('product').value;

    if (name && product && !isNaN(value)) {
        const newTotal = (counters[name] || 0) + value;
        counters[name] = newTotal;

        // Update local UI
        document.getElementById(name.toLowerCase() + '-counter').innerText = newTotal + "€";

        // Update Firebase
        set(ref(db, 'counters/' + name), {
            total: newTotal,
        });

        // Add purchase item to list and Firebase
        addPurchaseItem(name, product, value);
    }

    document.getElementById('value').value = '';
    document.getElementById('product').value = '';
});