module.exports = {
  siteMetadata: {
    title: `Blog by Adrian Varela`,
    author: {
      name: `Cesar Adrian Varela Guerrero`,
      bio: `Apasionado por la industria del software y las ultimas tendencias en desarrollo.`,
      photo: `/photo.jpg`,
    },
    menu: [
      { label: "Inicio", path: "/" },
      { label: "sobre mi", path: "/about" },
      { label: "Contacto", path: "/contacts" },
    ],
    description: `Sitio personal Developer profesional `,
    siteUrl: `https://adrian-varela.com/`,
    social: {
      twitter: `AdrianVarelaG`,
      github: `AdrianVarelaG`,
      linkedin: `AdrianVarelaG`,
      dev: "adrianvarelag",
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-155158880-1`,
      },
    },
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Adrian Varela Personal Blog`,
        short_name: `AdrianVarela`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#4675c2`,
        display: `minimal-ui`,
        icon: `static/photo.png`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-sass`,
  ],
}
