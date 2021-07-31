<script>
	import Games from "./games.svelte";
</script>

<div class="head">
	<div class="my-face">
		<img src="./my_face.png" alt="its me!, I've my hands in faced like I'm explaining something" width=200>
		<div class="background"></div>
	</div>
    <div class="heading-name">
        <h1>Aditya Shankar</h1>
        <p>WEBMASTER</p>
        <div class="background"></div>
    </div>
	<Games/>
</div>

<style>
	.head{
		width : 100%;
		max-width: 1100px;
		margin: 0 auto;
		display : flex;
		justify-content: space-between;
		align-items: center;
		padding-top : 100px;
		font-family: 'Zen Tokyo Zoo', cursive;
		flex-wrap: wrap;
	}

	h1{
		font-size: 4.5rem;
		padding : 0 30px;
		transition: clip-path 0.5s, background 0.5s;
		margin : 0;
	}

	.heading-name{
		position: relative;
	}

	.heading-name p{
		font-size: 1.5rem;
		border-bottom : 5px solid coral;
		width: max-content;
		margin: 20px auto;
		transition: border 0.5s, color 0.7s;
	}

	.heading-name .background{
		position: absolute;
		left: 0;
		top: 0;
		width : 100%;
		height : 100%;
		z-index: -1;
		clip-path: polygon(7% 37%, 100% 0, 87% 100%, 0 100%);
		background: cadetblue;
		transition: clip-path 0.5s, background 0.5s;
	}

	.heading-name:hover .background{
		clip-path: polygon(0 0, 95% 41%, 100% 86%, 11% 100%);
		background: chocolate;
	}

	.heading-name:hover p, .heading-name:active p{
		border-bottom: 10px solid darkcyan;
		color : white;
	}

	.my-face{
		clip-path: polygon(25% 11%, 60% 2%, 87% 19%, 91% 70%, 65% 99%, 0 100%, 0% 70%, 4% 34%);
		transition: all 0.5s;
		position:relative;
	}

	.my-face img{
		display : block;
	}

	.my-face:hover{
		clip-path: polygon(0 0, 57% 0, 100% 0, 100% 100%, 64% 100%, 0 100%, 0% 70%, 0 17%);
	}
	
	.my-face .background{
		transition: all 0.5s;
		position:absolute;
		left:0;
		top:0;
		width: 100%;
		height: 100%;
		z-index: -1;
		background: coral;
		clip-path: polygon(25% 11%, 60% 2%, 87% 19%, 91% 70%, 65% 99%, 0 100%, 0% 70%, 4% 34%);
	}

	.my-face:hover .background, .my-face:active .background{
		clip-path: polygon(35% 18%, 65% 30%, 99% 49%, 100% 100%, 64% 100%, 23% 85%, 8% 60%, 0 17%);
		background:crimson;
	}
</style>