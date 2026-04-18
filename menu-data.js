// ── FOODHUB MENU DATA ──
const menuItems = [
  { id:1, name:'Grilled Chicken Breast', cat:'chicken', price:8.99, badge:'Best Seller', img:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=480&q=80', desc:'Tender chicken breast marinated in herbs and spices, served with seasonal greens and lemon vinaigrette.' },
  { id:2, name:'Crispy Fried Chicken', cat:'chicken', price:9.99, badge:'Popular', img:'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=480&q=80', desc:'Golden crispy chicken with our signature secret coating. Perfect alongside seasoned fries.' },
  { id:3, name:'Spicy Buffalo Wings', cat:'chicken', price:11.99, badge:'Hot Pick', img:'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=480&q=80', desc:'Fiery wings glazed in hot sauce with ranch dip and fresh celery sticks.' },
  { id:4, name:'Honey Glazed Chicken', cat:'chicken', price:10.99, badge:null, img:'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=480&q=80', desc:'Sweet and savory honey-glazed chicken thighs with roasted seasonal vegetables.' },
  { id:5, name:'Classic Burger', cat:'burger', price:6.99, badge:null, img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&q=80', desc:'Juicy beef patty with fresh lettuce, ripe tomato, pickles and our special sauce on a toasted bun.' },
  { id:6, name:'Double Cheese Burger', cat:'burger', price:9.99, badge:'Fan Favorite', img:'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=480&q=80', desc:'Two beef patties, double cheddar cheese, crispy bacon and fresh toppings on a brioche bun.' },
  { id:7, name:'BBQ Bacon Burger', cat:'burger', price:10.99, badge:null, img:'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=480&q=80', desc:'Smoky BBQ sauce, crispy bacon, sautéed mushrooms and caramelized onions on a brioche bun.' },
  { id:8, name:'Veggie Burger', cat:'burger', price:8.99, badge:'Vegan', img:'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=480&q=80', desc:'Plant-based patty with creamy avocado, fresh greens and chipotle mayo.' },
  { id:9, name:'Margherita Pizza', cat:'pizza', price:10.99, badge:null, img:'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=480&q=80', desc:'Fresh buffalo mozzarella, San Marzano tomatoes and fresh basil on a thin hand-stretched crust.' },
  { id:10, name:'Pepperoni Pizza', cat:'pizza', price:12.99, badge:'Best Seller', img:'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=480&q=80', desc:'Loaded with premium pepperoni slices and extra-stretch mozzarella on our signature tomato base.' },
  { id:11, name:'Vegetarian Pizza', cat:'pizza', price:11.99, badge:null, img:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&q=80', desc:'Bell peppers, mushrooms, olives and red onions on a herbed tomato sauce.' },
  { id:12, name:'BBQ Chicken Pizza', cat:'pizza', price:13.99, badge:'New', img:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=480&q=80', desc:'Grilled chicken, smoky BBQ sauce, red onions and mozzarella on a golden crust.' },
  { id:13, name:'Chocolate Lava Cake', cat:'dessert', price:5.99, badge:'Indulgent', img:'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=480&q=80', desc:'Warm chocolate cake with a molten center, served warm with vanilla bean ice cream.' },
  { id:14, name:'New York Cheesecake', cat:'dessert', price:7.99, badge:null, img:'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&q=80', desc:'Classic creamy cheesecake with a graham cracker crust and fresh strawberry compote.' },
  { id:15, name:'Tiramisu', cat:'dessert', price:6.99, badge:'Italian', img:'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=480&q=80', desc:'Traditional Italian tiramisu with mascarpone cream, espresso-soaked ladyfingers and cocoa dust.' },
  { id:16, name:'Premium Ice Cream', cat:'dessert', price:4.99, badge:null, img:'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=480&q=80', desc:'Three generous scoops of handcrafted artisan ice cream with choice of toppings.' },
];

function renderCard(item) {
  const stars = `<div class="stars" style="margin-bottom:0.5rem">
    ${Array(5).fill('<svg class="star" viewBox="0 0 20 20"><path d="M10 1l2.39 7.26H20l-6.19 4.5 2.39 7.24L10 15.51l-6.2 4.49 2.39-7.24L0 8.26h7.61z"/></svg>').join('')}
  </div>`;
  return `
  <div class="food-card" data-cat="${item.cat}">
    <div class="food-card-img">
      <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&q=60'">
      ${item.badge ? `<span class="food-card-badge">${item.badge}</span>` : ''}
    </div>
    <div class="food-card-body">
      ${stars}
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <div class="food-card-footer">
        <span class="food-price">$${item.price.toFixed(2)}</span>
        <button class="add-btn" onclick="addToCart('${item.name.replace(/'/g, "\\'")}',${item.price},'${item.img}')" title="Add to cart" aria-label="Add ${item.name} to cart">+</button>
      </div>
    </div>
  </div>`;
}
