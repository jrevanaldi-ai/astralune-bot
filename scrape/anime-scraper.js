import axios from 'axios';
import * as cheerio from 'cheerio';

class AnimeScraper {
    constructor(baseUrl = 'https://otakudesu.best') {
        this.baseUrl = baseUrl;
        this.animeList = [];
    }

    async fetchAnimeList() {
        const response = await axios.get(`${this.baseUrl}/anime-list/`);
        this.$ = cheerio.load(response.data);
        return this.scrapeAnimeList();
    }

    scrapeAnimeList() {
        this.$('.jdlbar ul li').each((index, element) => {
            const linkElement = this.$(element).find('a.hodebgst');
            if (linkElement.length > 0) {
                const title = linkElement.text().replace(/\s*\(Subtitle Indonesia\)\s*$/, '');
                const url = linkElement.attr('href');
                
                let status = 'Completed';
                const statusElement = this.$(element).find('.detstat');
                if (statusElement.length > 0 && statusElement.text().includes('On-Going')) {
                    status = 'On-Going';
                }
                
                this.animeList.push({
                    title,
                    url,
                    status,
                    index: index + 1
                });
            }
        });

        return this.animeList;
    }

    getLatestAnime(limit = 10) {
        return this.animeList.slice(0, limit);
    }

    searchAnime(keyword) {
        keyword = keyword.toLowerCase();
        return this.animeList.filter(anime =>
            anime.title.toLowerCase().includes(keyword)
        );
    }

    async getAnimeDetail(url) {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const detailInfo = {};
        $('.infozingle p').each((index, element) => {
            const text = $(element).text().trim();
            if (text.includes(':')) {
                const [key, value] = text.split(':').map(s => s.trim());
                detailInfo[key] = value;
            }
        });

        const episodeLinks = [];
        $('.episodelist ul li').each((index, element) => {
            const linkElement = $(element).find('a');
            const dateElement = $(element).find('.zeebr');
            
            if (linkElement.length > 0) {
                episodeLinks.push({
                    title: linkElement.text().trim(),
                    url: linkElement.attr('href'),
                    date: dateElement.text().trim()
                });
            }
        });

        return {
            title: $('.jdlrx h1').text().replace(/\(Episode.*/, '').trim(),
            sinopsis: $('.sinopc p').text().trim(),
            detail: detailInfo,
            episodes: episodeLinks
        };
    }
}

export { AnimeScraper };