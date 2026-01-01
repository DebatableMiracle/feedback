<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> Web Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; max-width: 700px; margin: 4rem auto; padding: 0 1rem; color: #333; line-height: 1.6; }
          header { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #eaeaea; }
          h1 { margin: 0 0 0.5rem; font-size: 2rem; }
          p.desc { color: #666; margin: 0; }
          a { color: #0070f3; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .item { margin-bottom: 2.5rem; }
          .item h3 { margin: 0 0 0.5rem; }
          .item-meta { font-size: 0.875rem; color: #888; margin-bottom: 0.5rem; }
        </style>
      </head>
      <body>
        <header>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
          <p style="margin-top: 1rem; font-size: 0.9rem; color: #888;">
            This is an RSS feed. Subscribe by copying the URL into your news reader. 
            <a href="{/rss/channel/link}">Visit Website &#8594;</a>
          </p>
        </header>
        <xsl:for-each select="/rss/channel/item">
          <div class="item">
            <h3><a href="{link}" target="_blank"><xsl:value-of select="title"/></a></h3>
            <div class="item-meta">
              <xsl:value-of select="pubDate" />
            </div>
            <div class="item-desc">
              <xsl:value-of select="description"/>
            </div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
