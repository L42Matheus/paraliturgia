(function () {
  const form = document.getElementById('form-inscricao');
  const btn = document.getElementById('btn-enviar');
  const msg = document.getElementById('mensagem');
  const opcoesEl = document.getElementById('domingos-opcoes');
  const telefoneEl = document.getElementById('telefone');

  function checkboxes() {
    return Array.from(form.querySelectorAll('input[name="domingos"]'));
  }

  function selecionadas() {
    return checkboxes().filter((c) => c.checked);
  }

  function atualizarVisual() {
    checkboxes().forEach((c) => {
      c.parentElement.classList.toggle('selecionado', c.checked);
    });
  }

  opcoesEl.addEventListener('change', (ev) => {
    if (ev.target.name !== 'domingos') return;
    const marcados = selecionadas();
    if (marcados.length > 2) {
      ev.target.checked = false;
      mostrarErro(['Você só pode escolher 2 domingos. Desmarque um antes de trocar.']);
    } else {
      esconderMensagem();
    }
    atualizarVisual();
  });

  telefoneEl.addEventListener('input', () => {
    const digits = telefoneEl.value.replace(/\D/g, '').slice(0, 11);
    let out = digits;
    if (digits.length > 6) {
      out = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 2) {
      out = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      out = `(${digits}`;
    }
    telefoneEl.value = out;
  });

  function mostrarErro(lista) {
    msg.className = 'mensagem erro';
    msg.innerHTML = '<strong>Não foi possível enviar:</strong><ul>' +
      lista.map((e) => `<li>${e}</li>`).join('') + '</ul>';
  }

  function mostrarSucesso(nome) {
    msg.className = 'mensagem sucesso';
    msg.innerHTML = `<strong>Inscrição confirmada!</strong> Obrigado, ${nome}. Deus te abençoe.`;
  }

  function esconderMensagem() {
    msg.className = 'mensagem';
    msg.innerHTML = '';
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    esconderMensagem();

    const marcados = selecionadas().map((c) => Number(c.value));
    const dados = {
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      email: form.email.value.trim(),
      dataNascimento: form.dataNascimento.value,
      motivo: form.motivo.value.trim(),
      observacoes: form.observacoes.value.trim(),
      domingos: marcados,
    };

    const erros = [];
    if (dados.nome.length < 3) erros.push('Informe seu nome completo.');
    if (dados.telefone.replace(/\D/g, '').length < 10) erros.push('Informe um telefone válido.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.push('Informe um e-mail válido.');
    if (!dados.dataNascimento) erros.push('Informe sua data de nascimento.');
    if (dados.motivo.length < 20) erros.push('Conte-nos brevemente sua motivação (mínimo 20 caracteres).');
    if (marcados.length !== 2) erros.push('Escolha exatamente 2 domingos.');

    if (erros.length) {
      mostrarErro(erros);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const resp = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const body = await resp.json();
      if (!resp.ok || !body.ok) {
        mostrarErro(body.erros || ['Erro ao enviar. Tente novamente.']);
      } else {
        mostrarSucesso(dados.nome.split(' ')[0]);
        form.reset();
        atualizarVisual();
        msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      mostrarErro(['Sem conexão com o servidor. Tente novamente.']);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirmar inscrição';
    }
  });
})();
