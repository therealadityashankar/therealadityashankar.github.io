<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap" rel="stylesheet">

<script lang="ts">
	import Head from "./head.svelte";
	import Skills from "./skills.svelte";
	import Work from "./work.svelte";
	import Projects from "./projects.svelte";
	import Certifications from "./certifications.svelte";
	import Reviews from "./reviews.svelte";
</script>

<main>
	<Head/>

	<div class="navigation">
		<a href="#work">
			<div class="navpoint">
				Work
				<div class="back-before"></div>
				<div class="back"></div>
			</div>
		</a>
		
		<a href="#skills">
			<div class="navpoint skills">
				Skills
				<div class="back-before"></div>
				<div class="back"></div>
			</div>
		</a>

		<a href="#certifications">
			<div class="navpoint certifications">
				Certifications
				<div class="back-before"></div>
				<div class="back"></div>
			</div>
		</a>

		<a href="#reviews">
			<div class="navpoint reviews">
				Reviews
				<div class="back-before"></div>
				<div class="back"></div>
			</div>
		</a>
	</div>

	<div class="ability" id="work">
		<Work/>
		<Projects/>
	</div>

	<Skills/>
	<Certifications/>
	<Reviews/>
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Zen+Tokyo+Zoo&display=swap');

	main {
		text-align: center;
		padding: 1em;
	}

	.ability{
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
	}

	.navigation{
		display: flex;
		max-width: max-content;
		margin: 10px auto;
	}

	.navigation .navpoint{
		margin: 0 10px;
		position: relative;
		padding: 10px;
	}

	.navigation a{
		color: black;
		transition: all 0.5s;
		font-family: 'Josefin Sans', sans-serif;
	}

	.navpoint .back{
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 0%;
		background: rgb(139, 0, 127);
		clip-path: polygon(10.53% 21.61%, 100% 0px, 97.60% 64.10%, 2px 94.87%);
		transition: all 0.5s;
		z-index: -1;
	}

	.navpoint .back-before{
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background: rgb(24, 195, 67);
		transition: all 0.5s;
		clip-path: polygon(10.53% 21.61%, 100% 0px, 97.60% 64.10%, 2px 94.87%);
		z-index: -1;
	}

	.navpoint.skills .back-before{
		background: rgb(241, 125, 187);
	}

	.navpoint.certifications .back-before{
		background: rgb(125, 204, 241);
	}

	.navpoint.reviews .back-before{
		background: rgb(241, 220, 125);
	}

	.navpoint:hover .back{
		height: 100%;
	}

	.navigation a:hover{
		color: white;
		text-decoration: none;
	}
</style>