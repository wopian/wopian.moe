<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatAlbumDate } from '~~/shared/portfolio'
import {
	IconBrandVue,
	IconBrandTypescript,
	IconBrandJavascript,
	IconBrandNpm,
	IconBrandNodejs,
	IconBrandGraphql,
	IconBrandCSharp,
	IconBrandUnity,
	IconBrandEmber,
	IconBrandDocker,
	IconBrandVscode,
	IconBrandReact,
	IconDiamond,
} from '@tabler/icons-vue';

const technologies = {
	typescript: {
		name: 'TypeScript',
		icon: IconBrandTypescript
	},
	javascript: {
		name: 'JavaScript',
		icon: IconBrandJavascript
	},
	npm: {
		name: 'npm',
		icon: IconBrandNpm
	},
	bun: {
		name: 'Bun',
		icon: IconBrandNodejs
	},
	vue: {
		name: 'Vue',
		icon: IconBrandVue
	},
	graphql: {
		name: 'GraphQL',
		icon: IconBrandGraphql
	},
	csharp: {
		name: 'C# / .NET',
		icon: IconBrandCSharp
	},
	unity: {
		name: 'BepInEx / Unity',
		icon: IconBrandUnity
	},
	ember: {
		name: 'Ember.js',
		icon: IconBrandEmber
	},
	rails: {
		name: 'Ruby on Rails',
		icon: IconDiamond
	},
	ruby: {
		name: 'Ruby',
		icon: IconDiamond
	},
	docker: {
		name: 'Docker',
		icon: IconBrandDocker
	},
	vscode: {
		name: 'Visual Studio Code',
		icon: IconBrandVscode
	},
	react: {
		name: 'React',
		icon: IconBrandReact
	}
};

// derived structures for UI and fast lookup
const techList = Object.entries(technologies).map(([key, value]) => ({
	key,
	name: value.name,
	icon: value.icon
}));

const techKeyByName = Object.fromEntries(techList.map(t => [t.name, t.key] as const));

const versions = [
  {
	title: 'ZeepCentraal',
	description:
	  'Everything Zeepkist in one place: records, leaderboards, stats, tournaments, player profiles, community levels, mods and Track of the Day.',
	date: '2025-02-09T00:00:00.000Z',
	badge: 'Active Development',
	to: 'https://zeepki.st',
	target: '_blank',
	authors: [
		technologies.typescript,
		technologies.bun,
		technologies.vue,
		technologies.docker
	]
  },
  {
	title: 'ZeepCentraal Backend',
	description: 'Backend integration for ZeepCentraal and GTR with a public GraphQL API',
	date: '2025-04-29T00:00:00.000Z',
	badge: 'Active Development',
	to: 'https://zeepki.st/developer',
	target: '_blank',
	authors: [
		technologies.typescript,
		technologies.bun,
		technologies.graphql,
		technologies.docker
	]
  },
  {
	title: 'GTR',
	description: 'Zeepkist mod to record and submit your times to ZeepCentraal. Enables players to see World Record ghosts in Free Play and Personal Best/World Record tracking Online.',
	date: '2023-04-13T00:00:00.000Z',
	badge: 'Active Development',
	to: 'https://zeepki.st',
	target: '_blank',
	authors: [
		technologies.csharp,
		technologies.unity
	]
  },
  {
	title: 'Zeepkist Records',
	description:
	  'Original ZeepCentraal web app for tracking Zeepkist records, player profiles and level leaderboards.',
	date: '2023-01-08T00:00:00.000Z',
	endDate: '2024-10-22T00:00:00.000Z',
	to: 'https://zeepki.st',
	target: '_blank',
	authors: [
		technologies.typescript,
		technologies.vue
	]
  },
  {
	title: 'Kitsu',
	description: 'A JavaScript JSON:API client tailored for Kitsu.io, framework-agnostic and easy to use with any JSON:API compliant API.',
	date: '2017-04-28T00:00:00.000Z',
	badge: 'Long-term Support',
	to: 'https://www.npmjs.com/package/kitsu',
	target: '_blank',
	authors: [
		technologies.javascript,
		technologies.npm
	]
  },
  {
	title: 'Kitsu Season Trends',
	description: 'Daily-updated anime season trends since Autumn 2017, sourced from Kitsu and published as an open-source dataset, tracking popularity, ratings and engagement. Until 2025, this data was also served via a React web app.',
	date: '2017-06-11T00:00:00.000Z',
	badge: 'Long-term Support',
	to: 'https://github.com/wopian/kitsu-season-trends',
	target: '_blank',
	authors: [
		technologies.javascript,
		technologies.react
	]
  },
  {
	title: 'AGC Assembly',
	description: 'A Visual Studio Code extension providing syntax highlighting for AGC, AGS, Argus Honeywell 800 and AGC Binsource assembly languages.',
	date: '2016-12-28T00:00:00.000Z',
	badge: 'Long-term Support',
	to: 'https://marketplace.visualstudio.com/items?itemName=wopian.agc-assembly',
	target: '_blank',
	authors: [
		technologies.javascript,
		technologies.vscode
	]
  },
  {
	title: 'Apollo 11 Archive',
	description: 'Core maintainer of the Apollo 11 archive project, preserving and sharing the source code of the Apollo 11 Guidance Computer (AGC) and used in the historic 1969 moon landing.',
	date: '2016-07-13T00:00:00.000Z',
	badge: 'Long-term Support',
	to: 'https://github.com/chrislgarry/Apollo-11',
	target: '_blank',
	authors: [
		technologies.javascript,
		technologies.vscode
	]
  },
  {
	title: 'Material Slack Themes',
	description: 'A collection of Material Design inspired Slack themes for dark and light mode.',
	date: '2016-01-21T00:00:00.000Z',
	badge: 'Long-term Support',
	to: 'https://slack.wopian.me',
	target: '_blank',
	authors: [
		technologies.ruby,
	]
  },
  {
	title: 'Kitsu.app',
	description: 'An open-source web app for managing and tracking your anime and manga collection.',
	date: '2013-07-01T00:00:00.000Z',
	endDate: '2021-06-30T00:00:00.000Z',
	to: 'https://kitsu.app',
	target: '_blank',
	authors: [
		technologies.rails,
		technologies.ember,
		technologies.docker
	]
  },
  {
	title: 'Preferred Locale',
	description: 'An open-source library for obtaining the user\'s preferred locale against a list of supported locales provided by the application. Used in Kitsu.app and 40 other apps for locale negotiation.',
	date: '2020-07-12T00:00:00.000Z',
	endDate: '2025-08-07T00:00:00.000Z',
	to: 'https://wopian.github.io/preferred-locale',
	target: '_blank',
	authors: [
		technologies.typescript,
		technologies.npm
	]
  },
  {
	title: 'Smooth Corners',
	description: 'An open-source library for rendering superellipse (squircle) shapes in web applications using the CSS Houdini API.',
	date: '2020-07-28T00:00:00.000Z',
	badge: 'Long-term Support',
	to: 'https://github.com/wopian/smooth-corners',
	target: '_blank',
	authors: [
		technologies.javascript,
		technologies.npm
	]
  }
];

const enhanced = ref(false)
onMounted(() => { enhanced.value = true })
const selected = ref<string[]>([]);

// toggles a technology key in the selected list
function toggleTech(key: string) {
	const i = selected.value.indexOf(key);
	if (i === -1) selected.value.push(key);
	else selected.value.splice(i, 1);
}

// clear filters
function clearFilters() {
	selected.value = [];
}

const filteredVersions = computed(() => {
	if (selected.value.length === 0) return [...versions].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
	return [...versions].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).filter(v =>
		v.authors.some(a => {
			const key = techKeyByName[a.name];
			return key !== undefined && selected.value.includes(key);
		})
	);
});

// how many versions use each technology (for display in filter buttons). Sort highest to lowest with ties broken by name alphabetically.
const techListByCount = computed(() => {
	return techList
		.map(tech => {
			const count = versions.filter(v =>
				v.authors.some(a => a.name === tech.name)
			).length;
			return { ...tech, count };
		})
		.sort((a, b) => {
			if (b.count === a.count) {
				return a.name.localeCompare(b.name);
			}
			return b.count - a.count;
		});
});

const links = ref([
    {
      label: 'Sponsor me on GitHub Sponsors',
      to: 'https://github.com/sponsors/wopian'
    },
    {
      label: 'Support me on Ko-fi',
      to: 'https://ko-fi.com/wopian',

    }
  ])

usePortfolioSeo('Open-source software', 'Open-source projects and developer tools by WOPIAN.')
</script>

<template>
  <section class="software-page page-shell">
    <div class="software-intro"><h1>Software<span class="heading-dot">.</span></h1><p>Web apps, game mods, libraries, and tools I build and maintain.</p></div>
    <section class="support-section"><div><h2>Support open-source work.</h2><p>Sponsoring helps cover development, hosting, and maintenance.</p></div><div class="support-links"><a v-for="link in links" :key="link.to" class="outline-link" :href="link.to" target="_blank" rel="noopener noreferrer">{{ link.label }} <span aria-hidden="true">↗</span></a></div></section>
    <div v-if="enhanced" class="software-filters"><details><summary>Filter by technology <span>{{ selected.length ? `${selected.length} selected` : 'All technologies' }}</span></summary><div class="tech-filters" role="group" aria-label="Filter projects by technology"><button v-for="tech in techListByCount" :key="tech.key" type="button" :aria-pressed="selected.includes(tech.key)" @click="toggleTech(tech.key)">{{ tech.name }} <span>{{ tech.count }}</span></button><button v-if="selected.length" type="button" class="clear-filters" @click="clearFilters">Clear filters</button></div></details><div class="project-filter-status"><p class="filter-count" role="status">{{ filteredVersions.length }} {{ filteredVersions.length === 1 ? 'project' : 'projects' }}</p><button v-if="selected.length" type="button" class="text-link" @click="clearFilters">Clear filters</button></div></div>
    <div class="project-index">
      <article v-for="version in filteredVersions" :key="version.title" class="project-row">
        <div class="project-body"><h2><a :href="version.to" target="_blank" rel="noopener noreferrer">{{ version.title }} <span aria-hidden="true">↗</span></a></h2><p>{{ version.description }}</p><ul class="project-technologies" aria-label="Technologies"><li v-for="author in [...version.authors].sort((a, b) => a.name.localeCompare(b.name))" :key="author.name"><component :is="author.icon" :size="16" aria-hidden="true" />{{ author.name }}</li></ul></div>
        <div class="project-meta"><span v-if="version.badge" class="project-status">{{ version.badge }}</span><span>{{ formatAlbumDate(version.date) }}<template v-if="version.endDate"> – {{ formatAlbumDate(version.endDate) }}</template></span></div>
      </article>
    </div>
  </section>
</template>
