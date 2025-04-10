import "./Page403.css";
function Page403() {
  return (
    <>
      <div id="sec-1" class="section flex flex-col items-center">
        <div id="ctn">
          <div class="marquee">
            <div class="marquee-text"></div>
            <div class="marquee-text"></div>
            <div class="marquee-text"></div>
          </div>

          <div class="text-ctn">ERROR</div>

          <div id="forbidden">FORBIDDEN</div>

          <div class="text-ctn">
            HTTP
            <br />
            403
          </div>

          <div class="marquee">
            <div class="marquee-text"></div>
            <div class="marquee-text"></div>
            <div class="marquee-text"></div>
          </div>
        </div>
        <div class="mt-6">
          <a
            href="/home"
            class="text-white font-bold text-xl bg-black p-3 hover:shadow-md"
          >
            Go back
          </a>
        </div>
      </div>
    </>
  );
}
export default Page403;
