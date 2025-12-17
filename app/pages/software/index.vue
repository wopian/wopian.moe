<script setup lang="ts">
import { ref, computed } from 'vue';
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
	if (selected.value.length === 0) return versions;
	return versions.filter(v =>
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

useHead({
  title: 'Open‑Source Software by WOPIAN',
  meta: [
    {
      name: 'description',
      content: 'Open‑source projects and developer tools by WOPIAN. Explore libraries, CLI tools and web applications focused on TypeScript, Vue and modern web development.'
    }
  ]
})
</script>

<template>
	<!--
	<p>
		I'm a Senior Software Engineer focused on open‑source web applications and developer tooling. I design, build and maintain scalable, community‑driven projects—ranging from libraries and CLI tools to full‑stack apps—primarily using TypeScript, Vue, and modern web platforms.
	</p>
	-->

	<UPageCTA
		class="rounded-xl"
		:ui="{ container: 'py-12 lg:py-12' }"
		variant="soft"
		title="Support my open‑source work"
		description="If you use or enjoy my projects, sponsoring helps cover development, hosting and maintenance — enabling new features, fixes and long‑term upkeep. Every contribution helps."
	>
		<template #links>
		<UButton
			v-for="(link, index) in links"
			:key="link.to"
			:to="link.to"
			:variant="index === 0 ? 'solid' : 'soft'"
			:color="index === 0 ? 'accent' : 'neutral'"
			size="xl"
			target="_blank"
			rel="noopener"
		>
			{{ link.label }}
		</UButton>
		</template>
	</UPageCTA>

	<!-- Filter bar: multi-select for small screens, pill buttons for larger screens -->
	<div class="my-6">
		<!-- multi-select (mobile) -->
		<USelect
			v-model="selected"
			:options="techList.map(t => ({ label: t.name, value: t.key }))"
			multiple
			placeholder="Filter technologies"
			class="mb-4 md:hidden"
		/>

		<!-- button pills (desktop) -->
		<div class="hidden md:flex flex-wrap gap-2 items-center">
			<div class="flex flex-wrap gap-2">
				<UButton
					v-for="tech in techListByCount"
					:key="tech.key"
					:color="selected.includes(tech.key) ? 'accent' : 'neutral'"
					:variant="selected.includes(tech.key) ? 'solid' : 'outline'"
					size="sm"
					class="cursor-pointer"
					@click="() => toggleTech(tech.key)"
					:aria-pressed="selected.includes(tech.key)"
				>
					<component :is="tech.icon" class="w-4 h-4 mr-2" />
					{{ tech.name }} ({{ versions.filter(v => v.authors.some(a => a.name === tech.name)).length }})
				</UButton>
				<!-- clear button -->
				<UButton
					color="neutral"
					variant="ghost"
					size="sm"
					class="cursor-pointer"
					@click="clearFilters"
					v-if="selected.length > 0"
				>
					Clear
				</UButton>
			</div>
		</div>
	</div>

  <UChangelogVersions :indicator="true" :ui="{
	indicator: 'ml-3',
	beam: 'bg-accent'
  }">
	<UChangelogVersion
	  v-for="version in filteredVersions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())"
	  :key="version.title"
	  v-bind="version"
	  :badge="undefined"
	  class="flex items-start"
	  :ui="{
		container: 'flex-1',
		indicator: 'sticky top-(--ui-header-height) pt-4 -mt-4 flex flex-col items-end',
	  }"
	>
	  <template #indicator>
		<!-- circle div as indicator -->
		<div class="w-3 h-3 bg-accent rounded-full absolute top-5.5 -right-4.5 border border-bg"></div>

		<UBadge :label="version.badge" variant="soft" color="accent" v-if="version.badge" />

		<span class="text-sm text-muted">
			{{
				new Date(version.date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				})
			}}
		</span>
		<span class="text-sm text-muted" v-if="version.endDate">
			– {{
				new Date(version.endDate).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				})
			}}
		</span>
		<span class="text-sm text-muted">
			{{
				(() => {
					const start = new Date(version.date);
					const end = version.endDate ? new Date(version.endDate) : new Date();
					const ms = Math.abs(end.getTime() - start.getTime());
					const day = 1000 * 60 * 60 * 24;
					const days = Math.floor(ms / day);
					const years = Math.floor(days / 365);
					const months = Math.floor((days % 365) / 30);

					const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

					if (version.endDate) {
						if (years > 0) return `${plural(years, 'year')}${months ? ' ' + plural(months, 'month') : ''}`;
						if (months > 0) return plural(months, 'month');
						return plural(days, 'day');
					} else {
						const now = new Date();
						if (start <= now) {
							// active since start -> "active for X"
							const msSince = Math.abs(now.getTime() - start.getTime());
							const daysSince = Math.floor(msSince / day);
							const yearsSince = Math.floor(daysSince / 365);
							const monthsSince = Math.floor((daysSince % 365) / 30);
							if (yearsSince > 0) return `${plural(yearsSince, 'year')}${monthsSince ? ' ' + plural(monthsSince, 'month') : ''}`;
							if (monthsSince > 0) return `${plural(monthsSince, 'month')}`;
							return plural(daysSince, 'day');
						}
					}
				})()
			}}
		</span>

	  </template>

	  <template #authors>
		<div class="flex space-x-2">
		<template v-for="author in [...version.authors].sort((a, b) => a.name.localeCompare(b.name))" :key="author.name">
			<UButton
				color="neutral"
				variant="ghost"
				:aria-label="author.name"
			>
				<component
					:is="author.icon"
					class="w-5 h-5" />
				<span class="ml-2">{{ author.name }}</span>
			</UButton>
		</template>
		</div>
	  </template>
	</UChangelogVersion>
  </UChangelogVersions>
</template>
