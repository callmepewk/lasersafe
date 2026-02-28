// Templates de Email com Design Responsivo e Vertical

export const emailStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f3f4f6;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .email-header {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    padding: 40px 20px;
    text-align: center;
  }
  .email-logo {
    font-size: 32px;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 10px;
  }
  .email-subtitle {
    color: #e0e7ff;
    font-size: 16px;
  }
  .email-body {
    padding: 40px 30px;
  }
  .greeting {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 20px;
  }
  .content-section {
    margin-bottom: 30px;
    line-height: 1.6;
    color: #4b5563;
  }
  .info-box {
    background-color: #f9fafb;
    border-left: 4px solid #6366f1;
    padding: 20px;
    margin: 20px 0;
    border-radius: 4px;
  }
  .info-item {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .info-item:last-child {
    border-bottom: none;
  }
  .info-label {
    font-weight: 600;
    color: #374151;
    min-width: 120px;
  }
  .info-value {
    color: #6b7280;
    flex: 1;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #ffffff;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
    text-align: center;
  }
  .steps-list {
    background-color: #f9fafb;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  }
  .step-item {
    padding: 12px 0;
    display: flex;
    align-items: start;
  }
  .step-number {
    background-color: #6366f1;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    margin-right: 12px;
    flex-shrink: 0;
  }
  .step-text {
    color: #4b5563;
    padding-top: 4px;
  }
  .email-footer {
    background-color: #f9fafb;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  .footer-text {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }
  .unsubscribe-link {
    color: #6366f1;
    text-decoration: none;
  }
  @media only screen and (max-width: 600px) {
    .email-body {
      padding: 30px 20px;
    }
    .info-item {
      flex-direction: column;
    }
    .info-label {
      margin-bottom: 5px;
    }
  }
`;

export const createEmailTemplate = (content) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="email-logo">LaserCode</div>
      <div class="email-subtitle">Sistema Inteligente de Cálculo de Parâmetros Laser</div>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <div class="footer-text">
        <strong>LaserCode</strong> - Tecnologia de ponta para profissionais de saúde<br>
        © ${new Date().getFullYear()} LaserCode. Todos os direitos reservados.<br><br>
        <a href="#" class="unsubscribe-link">Cancelar assinatura de emails</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Template: Boas-vindas Trial
export const welcomeTrialEmail = (name, email, password, endDate) => createEmailTemplate(`
  <div class="greeting">🎉 Bem-vindo ao LaserCode!</div>
  
  <div class="content-section">
    Olá <strong>${name}</strong>!
  </div>
  
  <div class="content-section">
    Você recebeu acesso <strong>GRATUITO</strong> para testar nossa plataforma completa de cálculo de parâmetros laser dermatológicos por <strong>7 dias</strong>.
  </div>
  
  <div class="info-box">
    <div class="info-item">
      <span class="info-label">📧 Email:</span>
      <span class="info-value">${email}</span>
    </div>
    <div class="info-item">
      <span class="info-label">🔐 Senha:</span>
      <span class="info-value">${password}</span>
    </div>
    <div class="info-item">
      <span class="info-label">⏰ Período:</span>
      <span class="info-value">7 dias (até ${endDate})</span>
    </div>
  </div>
  
  <div style="text-align: center;">
    <a href="https://lasercode.app" class="cta-button">🚀 Acessar LaserCode Agora</a>
  </div>
  
  <div class="content-section">
    <strong>Durante o período de teste, você terá acesso a:</strong>
  </div>
  
  <div class="steps-list">
    <div class="step-item">
      <div class="step-number">✓</div>
      <div class="step-text">Calculadora de parâmetros laser com IA</div>
    </div>
    <div class="step-item">
      <div class="step-number">✓</div>
      <div class="step-text">Cadastro de pacientes e profissionais</div>
    </div>
    <div class="step-item">
      <div class="step-number">✓</div>
      <div class="step-text">Histórico completo de procedimentos</div>
    </div>
    <div class="step-item">
      <div class="step-number">✓</div>
      <div class="step-text">Guias de referência especializados</div>
    </div>
    <div class="step-item">
      <div class="step-number">✓</div>
      <div class="step-text">Suporte via chatbot com IA</div>
    </div>
  </div>
  
  <div class="content-section">
    Se tiver dúvidas, nossa equipe está à disposição!
  </div>
  
  <div class="content-section">
    <strong>Atenciosamente,</strong><br>
    Equipe LaserCode
  </div>
`);

// Template: Extensão de Trial
export const extendTrialEmail = (name, days, newEndDate) => createEmailTemplate(`
  <div class="greeting">⏰ Período de Teste Estendido</div>
  
  <div class="content-section">
    Olá <strong>${name}</strong>!
  </div>
  
  <div class="content-section">
    Ótimas notícias! 🎉
  </div>
  
  <div class="content-section">
    Seu período de teste no LaserCode foi <strong>ESTENDIDO</strong> por mais <strong>${days} dias</strong>!
  </div>
  
  <div class="info-box">
    <div class="info-item">
      <span class="info-label">📅 Nova data de término:</span>
      <span class="info-value">${newEndDate}</span>
    </div>
  </div>
  
  <div style="text-align: center;">
    <a href="https://lasercode.app" class="cta-button">Continuar Usando LaserCode</a>
  </div>
  
  <div class="content-section">
    Continue aproveitando todos os recursos da plataforma!
  </div>
  
  <div class="content-section">
    <strong>Atenciosamente,</strong><br>
    Equipe LaserCode
  </div>
`);

// Template: Conta Ativada (Trial → Normal)
export const accountActivatedEmail = (name) => createEmailTemplate(`
  <div class="greeting">🎊 Conta Ativada com Sucesso!</div>
  
  <div class="content-section">
    Olá <strong>${name}</strong>!
  </div>
  
  <div class="content-section">
    <strong>Parabéns!</strong> 🎉
  </div>
  
  <div class="content-section">
    Sua conta de teste foi <strong>CONVERTIDA</strong> para uma conta regular no LaserCode!
  </div>
  
  <div class="info-box">
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
      <div style="font-size: 18px; font-weight: bold; color: #10b981;">
        Acesso Completo e Ilimitado
      </div>
      <div style="color: #6b7280; margin-top: 10px;">
        Sem restrições de tempo
      </div>
    </div>
  </div>
  
  <div style="text-align: center;">
    <a href="https://lasercode.app" class="cta-button">Acessar Minha Conta</a>
  </div>
  
  <div class="content-section">
    Continue aproveitando todos os recursos do LaserCode sem limites!
  </div>
  
  <div class="content-section">
    Se tiver dúvidas, estamos à disposição.
  </div>
  
  <div class="content-section">
    <strong>Atenciosamente,</strong><br>
    Equipe LaserCode
  </div>
`);

// Template: Conta Encerrada
export const accountClosedEmail = (name) => createEmailTemplate(`
  <div class="greeting">Conta de Teste Encerrada</div>
  
  <div class="content-section">
    Olá <strong>${name}</strong>,
  </div>
  
  <div class="content-section">
    Informamos que sua conta de teste no LaserCode foi encerrada.
  </div>
  
  <div class="content-section">
    Se você deseja continuar usando nossa plataforma, entre em contato conosco para criar uma conta regular.
  </div>
  
  <div style="text-align: center;">
    <a href="mailto:suporte@lasercode.app" class="cta-button">Entrar em Contato</a>
  </div>
  
  <div class="content-section">
    Agradecemos por ter testado o LaserCode!
  </div>
  
  <div class="content-section">
    <strong>Atenciosamente,</strong><br>
    Equipe LaserCode
  </div>
`);

// Template: Atualização do Sistema
export const systemUpdateEmail = (name, siteUrl = "https://lasercode.app") => createEmailTemplate(`
  <div class="greeting">🔄 Atualização do Sistema</div>
  
  <div class="content-section">
    Olá <strong>${name}</strong>,
  </div>
  
  <div class="content-section">
    O sistema LaserCode foi <strong>atualizado</strong> com novas funcionalidades e melhorias!
  </div>
  
  <div class="content-section">
    Para garantir a melhor experiência, por favor siga os passos abaixo:
  </div>
  
  <div class="steps-list">
    <div class="step-item">
      <div class="step-number">1</div>
      <div class="step-text">Clique no link abaixo para acessar a versão atualizada</div>
    </div>
    <div class="step-item">
      <div class="step-number">2</div>
      <div class="step-text">Se necessário, limpe o cache do navegador (<strong>Ctrl+Shift+Delete</strong>)</div>
    </div>
    <div class="step-item">
      <div class="step-number">3</div>
      <div class="step-text">Faça login novamente se solicitado</div>
    </div>
  </div>
  
  <div class="info-box" style="text-align: center;">
    <div style="margin-bottom: 10px; font-weight: 600; color: #374151;">🔗 Link Direto para o Sistema Atualizado:</div>
    <a href="${siteUrl}" style="color: #6366f1; font-size: 16px; word-break: break-all;">${siteUrl}</a>
  </div>
  
  <div style="text-align: center;">
    <a href="${siteUrl}" class="cta-button">🚀 Acessar LaserCode Atualizado</a>
  </div>
  
  <div class="content-section">
    Isso garantirá que você tenha acesso a todas as novidades.
  </div>
  
  <div class="content-section">
    <strong>Atenciosamente,</strong><br>
    Equipe LaserCode
  </div>
`);

// Template: Notificação Personalizada
export const customNotificationEmail = (name, title, message) => createEmailTemplate(`
  <div class="greeting">📢 ${title}</div>
  
  <div class="content-section">
    Olá <strong>${name}</strong>,
  </div>
  
  <div class="content-section">
    ${message.split('\n').map(line => `<div style="margin-bottom: 10px;">${line}</div>`).join('')}
  </div>
  
  <div style="text-align: center;">
    <a href="https://lasercode.app" class="cta-button">Acessar LaserCode</a>
  </div>
  
  <div class="content-section">
    <strong>Atenciosamente,</strong><br>
    Equipe LaserCode
  </div>
`);

// Template: Conta Excluída (Admin)
export const accountDeletedEmail = (name, email, date) => createEmailTemplate(`
  <div class="greeting">Conta Encerrada</div>
  
  <div class="content-section">
    Prezado(a) <strong>${name}</strong>,
  </div>
  
  <div class="content-section">
    Informamos que sua conta no LaserCode foi <strong>encerrada</strong> pelos administradores do sistema.
  </div>
  
  <div class="info-box">
    <div class="info-item">
      <span class="info-label">📧 Email:</span>
      <span class="info-value">${email}</span>
    </div>
    <div class="info-item">
      <span class="info-label">👤 Nome:</span>
      <span class="info-value">${name}</span>
    </div>
    <div class="info-item">
      <span class="info-label">📅 Data:</span>
      <span class="info-value">${date}</span>
    </div>
  </div>
  
  <div class="content-section">
    Seus dados foram removidos de nossa plataforma conforme solicitado pelos administradores.
  </div>
  
  <div class="content-section">
    Se você acredita que isso foi feito por engano ou tem alguma dúvida, entre em contato com nossa equipe de suporte.
  </div>
  
  <div style="text-align: center;">
    <a href="mailto:suporte@lasercode.app" class="cta-button">Contatar Suporte</a>
  </div>
  
  <div class="content-section">
    <strong>Atenciosamente,</strong><br>
    Equipe LaserCode
  </div>
`);