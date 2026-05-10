<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Такой страницы не существует или она была удалена</p>
      <router-link to="/" class="home-link">← Вернуться в календарь</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  font-family: 'Segoe UI', Arial, sans-serif;
}

.not-found-card {
  text-align: center;
  background: white;
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  max-width: 450px;
}

.not-found-card h1 {
  font-size: 6rem;
  margin: 0;
  color: #1976D2;
  font-weight: 800;
  line-height: 1;
}

.not-found-card h2 {
  margin: 10px 0;
  color: #333;
  font-size: 1.5rem;
}

.not-found-card p {
  color: #777;
  margin-bottom: 30px;
  font-size: 0.95rem;
}

.home-link {
  display: inline-block;
  background: #1976D2;
  color: white;
  padding: 12px 28px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s;
}

.home-link:hover {
  background: #1565C0;
}
</style>