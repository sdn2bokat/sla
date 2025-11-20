/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        xirod: ["Xirod", "sans-serif"],
        ibm: ["Courier New", "monospace"],
        customFont: ["Special Elite" , "serif"],
        vibes: ["Great Vibes" , "serif"],
      },
      colors: {
        primary: '#2f81e5ff',       // biru muda
        primaryDark: '#3a72caff',   // biru gelap untuk hover
        secondary: '#f0e04dff',     // kuning/oranye aksen
        accent: '#f84949ff',        // merah/merah muda
        textTitle: '#03538bff',     // warna teks judul
        textNormal: '#1F2937',    // teks normal
        bgLight: '#F3F4F6',       // latar belakang terang
        bgDark: '#fafafaff',        // latar belakang kuning terang
        bgErr: '#f7a4a4ff',        // latar belakang latar belakang kesalahan
        bgSucc: '#bbe2b2ff',        // latar belakang latar belakang sukses
        textHijau: '#2ba02bff',        // hijau tua
      },
      boxShadow: {
        soft: "0 4px 14px rgba(0,0,0,0.1)",
      },
      transitionTimingFunction: {
        "out-elastic": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      backgroundImage: {
        'header-gradient': 'var(--background-image-header)',
      },
      textShadow: {
        sm: '1px 1px 2px rgba(0,0,0,0.25)',
        DEFAULT: '2px 2px 4px rgba(0,0,0,0.35)',
        lg: '3px 3px 6px rgba(0,0,0,0.5)',
        blue: '2px 2px 5px rgba(240, 240, 240, 1)', //
      },
    },
  },
  plugins: [
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    },
  ],
};
