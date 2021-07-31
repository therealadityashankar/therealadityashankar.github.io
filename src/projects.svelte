<script>
    import {onMount} from "svelte";

    onMount(() => {
        const codeStuff = document.getElementById("code-stuff");
        document.getElementById("coding-thingy").appendChild(codeStuff);
        codeStuff.style.display = "";
    })
</script>

<div class="projects">
    <h1>Projects I've worked on</h1>
    <div class="project">
        <h2>wc-code, a way to write and run code online</h2>
        <p><a href="https://github.com/vanillawc/wc-code" target="_blank">https://github.com/vanillawc/wc-code</a></p>
        <div id="coding-thingy">
            <div class="back back-1"></div>
            <div class="back back-2"></div>
        </div>
    </div>

    <div class="project project-2">
        <h2>Flask Value Checker</h2>
        <div>
            <p>An alternative to WTForms in flask for easy type checking in forms</p>
            <p><a href="https://github.com/therealadityashankar/flask-value-checker" target="_blank">https://github.com/therealadityashankar/flask-value-checker</a></p>
        </div>
        <div class="back back-1"></div>
        <div class="back back-2"></div>
    </div>
</div>


<style>
    .projects{
        font-family: 'Josefin Sans', sans-serif;
    }

    .project{
        margin-bottom: 70px;
        position: relative;
        padding: 30px;
    }

    h1{
        font-size: 3rem;
        margin-top: 80px;
    }

    #coding-thingy{
        text-align: left;
    }

    .project .back{
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        transition: all 0.5s;
    }

    .project .back-1{
        clip-path: polygon(0px 8%, 97.66% 2px, 93.25% 86.48%, 6% 100%);
        background: rgb(140, 210, 193);
    }

    .project .back-2{
        clip-path: polygon(-1px 4.59%, 98.03% 10px, 92.13% 91.17%, 3.57% 93.61%);
        background: rgb(139, 57, 46);
        z-index: -2;
    }

    .project.project-2 .back-1{
        background: tan;
    }

    .project.project-2 .back-2{
        background: seagreen;
    }

    .project:hover .back-1{
        clip-path: polygon(-1px 4.59%, 98.03% 10px, 92.13% 91.17%, 3.57% 93.61%);
    }

    .project:hover .back-2{
        clip-path: polygon(0px 8%, 97.66% 2px, 93.25% 86.48%, 6% 100%);
    }
</style>