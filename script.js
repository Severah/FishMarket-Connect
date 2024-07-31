document.addEventListener('DOMContentLoaded', function() {
    const priceList = document.getElementById('priceList');
    const listingsGrid = document.getElementById('listingsGrid');
    const orderList = document.getElementById('orderList');
    const discussionThreads = document.getElementById('discussionThreads');
    
    // Fetch and display real-time prices
    fetch('/api/prices')
        .then(response => response.json())
        .then(data => {
            data.forEach(price => {
                const div = document.createElement('div');
                div.className = 'price';
                div.innerHTML = `
                    <h3>${price.fish}</h3>
                    <p>Price: ${price.price}</p>
                `;
                priceList.appendChild(div);
            });
        });

    // Fetch and display listings
    fetch('/api/listings')
        .then(response => response.json())
        .then(data => {
            data.forEach(listing => {
                const div = document.createElement('div');
                div.className = 'listing';
                div.innerHTML = `
                    <h3>${listing.name}</h3>
                    <p>${listing.description}</p>
                    <p>Price: ${listing.price}</p>
                `;
                listingsGrid.appendChild(div);
            });
        });

    // Fetch and display orders
    fetch('/api/orders')
        .then(response => response.json())
        .then(data => {
            data.forEach(order => {
                const div = document.createElement('div');
                div.className = 'order';
                div.innerHTML = `
                    <h3>Order #${order.id}</h3>
                    <p>Status: ${order.status}</p>
                `;
                orderList.appendChild(div);
            });
        });

    // Fetch and display forum threads
    fetch('/api/threads')
        .then(response => response.json())
        .then(data => {
            data.forEach(thread => {
                const div = document.createElement('div');
                div.className = 'thread';
                div.innerHTML = `
                    <h3>${thread.title}</h3>
                    <p>${thread.content}</p>
                `;
                discussionThreads.appendChild(div);
            });
        });
});