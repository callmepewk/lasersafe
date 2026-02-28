import { useEffect } from 'react';

/**
 * ADBLOCKER ULTRA AGRESSIVO - Remove o botão Edit with Base44
 * Usa 10+ estratégias diferentes para garantir remoção total
 */
export default function AdBlocker() {
  useEffect(() => {
    // Estratégia 1: Injetar CSS diretamente no HEAD
    const injectBlockingCSS = () => {
      const styleId = 'base44-adblocker-ultimate';
      if (document.getElementById(styleId)) return;
      
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* BLOQUEAR TUDO relacionado a edit/base44 */
        button[title*="edit" i],
        button[title*="base44" i],
        button[aria-label*="edit" i],
        button[class*="edit"],
        button[class*="base44"],
        a[href*="base44"],
        iframe[src*="base44"],
        div[class*="base44"],
        [data-base44],
        button[style*="position: fixed"][style*="z-index"],
        button[style*="position: fixed"][style*="bottom"],
        button[style*="position: fixed"][style*="right"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -99999px !important;
          top: -99999px !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
          clip: rect(0,0,0,0) !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          z-index: -9999 !important;
        }
      `;
      document.head.appendChild(style);
    };

    // Estratégia 2: Remover elementos por múltiplos critérios
    const removeBase44Elements = () => {
      // Lista MASSIVA de seletores
      const selectors = [
        'button[title*="edit" i]',
        'button[title*="Edit" i]',
        'button[title*="EDIT" i]',
        'button[title*="base44" i]',
        'button[title*="Base44" i]',
        'button[aria-label*="edit" i]',
        'button[aria-label*="Edit" i]',
        'a[href*="base44"]',
        'iframe[src*="base44"]',
        '[class*="base44"]',
        '[id*="base44"]',
        '[data-base44]',
        '.base44-edit-button',
        '#base44-edit-button',
      ];

      // Remover por seletor
      selectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            if (el && el.parentNode) {
              el.remove();
            }
          });
        } catch (e) {
          // Ignora erros
        }
      });

      // Estratégia 3: Remover TODOS os botões fixos no canto inferior
      document.querySelectorAll('button').forEach(button => {
        try {
          const style = window.getComputedStyle(button);
          const rect = button.getBoundingClientRect();
          
          // Detectar botões fixos no canto inferior direito
          const isFixed = style.position === 'fixed' || style.position === 'absolute';
          const isBottomRight = rect.bottom > window.innerHeight - 200 && rect.right > window.innerWidth - 200;
          const hasHighZIndex = parseInt(style.zIndex) > 100;
          
          // Verificar conteúdo do botão
          const text = (button.textContent || '').toLowerCase();
          const title = (button.getAttribute('title') || '').toLowerCase();
          const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
          
          const hasEditText = text.includes('edit') || title.includes('edit') || ariaLabel.includes('edit');
          const hasBase44Text = text.includes('base44') || title.includes('base44') || ariaLabel.includes('base44');
          
          // Se for um botão suspeito, DESTRUIR!
          if ((isFixed && isBottomRight) || hasEditText || hasBase44Text || hasHighZIndex) {
            button.style.display = 'none';
            button.style.visibility = 'hidden';
            button.style.opacity = '0';
            button.style.pointerEvents = 'none';
            button.remove();
          }
        } catch (e) {
          // Ignora erros
        }
      });

      // Estratégia 4: Remover elementos Shadow DOM
      document.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) {
          try {
            el.shadowRoot.querySelectorAll('button').forEach(btn => {
              const text = (btn.textContent || '').toLowerCase();
              if (text.includes('edit') || text.includes('base44')) {
                btn.remove();
              }
            });
          } catch (e) {
            // Ignora erros
          }
        }
      });

      // Estratégia 5: Remover portais Radix UI
      document.querySelectorAll('[data-radix-portal], [data-radix-popper-content-wrapper]').forEach(portal => {
        try {
          portal.querySelectorAll('button').forEach(btn => {
            const text = (btn.textContent || '').toLowerCase();
            const title = (btn.getAttribute('title') || '').toLowerCase();
            if (text.includes('edit') || title.includes('edit') || text.includes('base44')) {
              btn.remove();
            }
          });
        } catch (e) {
          // Ignora erros
        }
      });
    };

    // Estratégia 6: MutationObserver ULTRA SENSÍVEL
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Verificar novos nós adicionados
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            try {
              // Se for um botão
              if (node.tagName === 'BUTTON') {
                const text = (node.textContent || '').toLowerCase();
                const title = (node.getAttribute('title') || '').toLowerCase();
                if (text.includes('edit') || text.includes('base44') || title.includes('edit')) {
                  node.remove();
                  return;
                }
              }
              
              // Se contém botões suspeitos
              node.querySelectorAll && node.querySelectorAll('button').forEach(btn => {
                const text = (btn.textContent || '').toLowerCase();
                const title = (btn.getAttribute('title') || '').toLowerCase();
                if (text.includes('edit') || text.includes('base44') || title.includes('edit')) {
                  btn.remove();
                }
              });
            } catch (e) {
              // Ignora erros
            }
          }
        });
      });
      
      // Executar remoção completa também
      removeBase44Elements();
    });

    // Injetar CSS primeiro
    injectBlockingCSS();

    // Executar remoção imediatamente
    removeBase44Elements();

    // Executar a cada 50ms nos primeiros 10 segundos (ultra rápido!)
    const ultraFastInterval = setInterval(removeBase44Elements, 50);
    setTimeout(() => clearInterval(ultraFastInterval), 10000);

    // Depois continuar a cada 500ms indefinidamente
    const continuousInterval = setInterval(removeBase44Elements, 500);

    // Observar TODO o documento
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'title', 'aria-label']
    });

    // Estratégia 7: Interceptar eventos de clique em botões suspeitos
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (target) {
        const text = (target.textContent || '').toLowerCase();
        const title = (target.getAttribute('title') || '').toLowerCase();
        if (text.includes('edit') || text.includes('base44') || title.includes('edit')) {
          e.stopPropagation();
          e.preventDefault();
          target.remove();
        }
      }
    }, true);

    // Cleanup
    return () => {
      clearInterval(continuousInterval);
      observer.disconnect();
    };
  }, []);

  return null;
}