'use client';

import { useEffect, useRef } from 'react';

const ASCIIHeader = ({ onArcadeClick }) => {
    const preRef = useRef(null);

    useEffect(() => {
        const asciiArt = String.raw`
                                                                               ''''''                                                                                                              
                                                                               '::::'                                                                                lllllll         tttt          
                                                                               '::::'                                                                                l:::::l      ttt:::t          
                                                                               ':::''                                                                                l:::::l      t:::::t          
                                                                              ':::'                                                                                  l:::::l      t:::::t          
zzzzzzzzzzzzzzzzz    eeeeeeeeeeee       mmmmmmm    mmmmmmm      ooooooooooo   ''''       ssssssssss        vvvvvvv           vvvvvvvaaaaaaaaaaaaa  uuuuuu    uuuuuu   l::::lttttttt:::::ttttttt    
z:::::::::::::::z  ee::::::::::::ee   mm:::::::m  m:::::::mm  oo:::::::::::oo          ss::::::::::s        v:::::v         v:::::v a::::::::::::a u::::u    u::::u   l::::lt:::::::::::::::::t    
z::::::::::::::z  e::::::eeeee:::::eem::::::::::mm::::::::::mo:::::::::::::::o       ss:::::::::::::s        v:::::v       v:::::v  aaaaaaaaa:::::au::::u    u::::u   l::::lt:::::::::::::::::t    
zzzzzzzz::::::z  e::::::e     e:::::em::::::::::::::::::::::mo:::::ooooo:::::o       s::::::ssss:::::s        v:::::v     v:::::v            a::::au::::u    u::::u   l::::ltttttt:::::::tttttt    
      z::::::z   e:::::::eeeee::::::em:::::mmm::::::mmm:::::mo::::o     o::::o        s:::::s  ssssss          v:::::v   v:::::v      aaaaaaa:::::au::::u    u::::u   l::::l      t:::::t          
     z::::::z    e:::::::::::::::::e m::::m   m::::m   m::::mo::::o     o::::o          s::::::s                v:::::v v:::::v     aa::::::::::::au::::u    u::::u   l::::l      t:::::t          
    z::::::z     e::::::eeeeeeeeeee  m::::m   m::::m   m::::mo::::o     o::::o             s::::::s              v:::::v:::::v     a::::aaaa::::::au::::u    u::::u   l::::l      t:::::t          
   z::::::z      e:::::::e           m::::m   m::::m   m::::mo::::o     o::::o       ssssss   s:::::s             v:::::::::v     a::::a    a:::::au:::::uuuu:::::u   l::::l      t:::::t    tttttt
  z::::::zzzzzzzze::::::::e          m::::m   m::::m   m::::mo:::::ooooo:::::o       s:::::ssss::::::s             v:::::::v      a::::a    a:::::au:::::::::::::::uul::::::l     t::::::tttt:::::t
 z::::::::::::::z e::::::::eeeeeeee  m::::m   m::::m   m::::mo:::::::::::::::o       s::::::::::::::s               v:::::v       a:::::aaaa::::::a u:::::::::::::::ul::::::l     tt::::::::::::::t
z:::::::::::::::z  ee:::::::::::::e  m::::m   m::::m   m::::m oo:::::::::::oo         s:::::::::::ss                 v:::v         a::::::::::aa:::a uu::::::::uu:::ul::::::l       tt:::::::::::tt
zzzzzzzzzzzzzzzzz    eeeeeeeeeeeeee  mmmmmm   mmmmmm   mmmmmm   ooooooooooo            sssssssssss                    vvv           aaaaaaaaaa  aaaa   uuuuuuuu  uuuullllllll         ttttttttttt  
`;

        const el = preRef.current;
        if (!el) return;

        const GLITCH_CHARS = "!@#$%&*?<>/\\[]{}~░▒▓█";

        function randomChar() {
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }

        function glitchify(target, progress) {
            return target
                .split("")
                .map((ch) => {
                    if (ch === "\n" || ch === " ") return ch;
                    return Math.random() < progress ? ch : randomChar();
                })
                .join("");
        }

        // Animate once on load
        let start = null;
        const duration = 1400;

        function animateOnce(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            el.textContent = glitchify(asciiArt, progress);

            if (progress < 1) {
                requestAnimationFrame(animateOnce);
            }
        }

        requestAnimationFrame(animateOnce);

        // Occasional glitch pulse
        const pulseInterval = setInterval(() => {
            let flick = 0;
            const flickAnim = setInterval(() => {
                el.textContent = glitchify(asciiArt, Math.random());
                flick++;
                if (flick > 6) {
                    el.textContent = asciiArt;
                    clearInterval(flickAnim);
                }
            }, 45);
        }, 5000);

        return () => {
            clearInterval(pulseInterval);
        };
    }, []);

    return (
        <header className="ascii-header">
            <pre ref={preRef} className="ascii-art"></pre>
            <span
                className="alien-emoji"
                onClick={onArcadeClick}
                style={{ cursor: 'pointer', marginLeft: '1rem', fontSize: '2rem' }}
            >
                👾
            </span>
        </header>
    );
};

export default ASCIIHeader;
