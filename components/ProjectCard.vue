<template>
  <div class="flex-shrink-0 w-80 snap-start group cursor-pointer">
    <div class="relative overflow-hidden rounded-2xl shadow-xl h-96">
      <img 
        :src="image" 
        :alt="title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 class="text-white font-bold text-lg">{{ title }}</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  image: String
})
</script>
