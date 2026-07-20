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

  const condicionais = document.querySelectorAll('input[type="radio"][data-condicional]');
  condicionais.forEach((r) => r.addEventListener('change', atualizarCondicionais));
  atualizarCondicionais();

  function atualizarCondicionais() {
    const grupos = new Map();
    condicionais.forEach((r) => {
      const alvo = r.dataset.condicional;
      if (!grupos.has(alvo)) grupos.set(alvo, false);
      if (r.checked && r.value === '1') grupos.set(alvo, true);
    });
    for (const [id, mostrar] of grupos) {
      const bloco = document.getElementById(id);
      if (!bloco) continue;
      bloco.hidden = !mostrar;
      const input = bloco.querySelector('input, textarea');
      if (input) {
        if (mostrar) {
          input.setAttribute('required', 'required');
        } else {
          input.removeAttribute('required');
          input.value = '';
        }
      }
    }
  }

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
    const radioValor = (nome) => {
      const el = form.querySelector(`input[name="${nome}"]:checked`);
      return el ? el.value : '';
    };

    const dados = {
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      email: form.email.value.trim(),
      dataNascimento: form.dataNascimento.value,
      bairro: form.bairro.value.trim(),
      estadoCivil: radioValor('estadoCivil'),
      batizado: radioValor('batizado'),
      fezPrimeiraComunhao: radioValor('fezPrimeiraComunhao'),
      primeiraComunhao: form.primeiraComunhao.value.trim(),
      fezEjc: radioValor('fezEjc'),
      ejcLocal: form.ejcLocal.value.trim(),
      fezCrisma: radioValor('fezCrisma'),
      crismaLocal: form.crismaLocal.value.trim(),
      outraPastoral: radioValor('outraPastoral'),
      outraPastoralQual: form.outraPastoralQual.value.trim(),
      cienteCompromisso: form.cienteCompromisso.checked ? '1' : '',
      motivo: form.motivo.value.trim(),
      observacoes: form.observacoes.value.trim(),
      domingos: marcados,
    };

    const erros = [];
    if (dados.nome.length < 3) erros.push('Informe seu nome completo.');
    if (dados.telefone.replace(/\D/g, '').length < 10) erros.push('Informe um telefone válido.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.push('Informe um e-mail válido.');
    if (!dados.dataNascimento) erros.push('Informe sua data de nascimento.');
    if (dados.bairro.length < 2) erros.push('Informe seu bairro.');
    if (!dados.estadoCivil) erros.push('Selecione seu estado civil.');
    if (!dados.batizado) erros.push('Informe se é batizado(a).');
    if (!dados.fezPrimeiraComunhao) erros.push('Informe se fez a primeira comunhão.');
    if (dados.fezPrimeiraComunhao === '1' && dados.primeiraComunhao.length < 2) erros.push('Informe onde/quando fez a primeira comunhão.');
    if (!dados.fezEjc) erros.push('Informe se fez EJC.');
    if (dados.fezEjc === '1' && dados.ejcLocal.length < 2) erros.push('Informe onde fez o EJC.');
    if (!dados.fezCrisma) erros.push('Informe se fez a crisma.');
    if (dados.fezCrisma === '1' && dados.crismaLocal.length < 2) erros.push('Informe onde fez a crisma.');
    if (!dados.outraPastoral) erros.push('Informe se participa de outra pastoral.');
    if (dados.outraPastoral === '1' && dados.outraPastoralQual.length < 2) erros.push('Informe qual pastoral.');
    if (marcados.length !== 2) erros.push('Escolha exatamente 2 domingos.');
    if (dados.cienteCompromisso !== '1') erros.push('Confirme que está ciente do compromisso com os encontros mensais.');
    if (dados.motivo.length < 20) erros.push('Conte-nos brevemente sua motivação (mínimo 20 caracteres).');

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
        atualizarCondicionais();
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
