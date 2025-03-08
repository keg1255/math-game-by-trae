# ���ýű�����ΪUTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ���������ϳɶ���
Add-Type -AssemblyName System.Speech
$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer

# ������������
$voice = $synthesizer.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture -like 'zh-*' } | Select-Object -First 1
if ($voice) {
    Write-Host "�ҵ�����������$($voice.VoiceInfo.Name)"
    $synthesizer.SelectVoice($voice.VoiceInfo.Name)
} else {
    Write-Host "���棺δ�ҵ�������������ʹ��Ĭ����������ȷ��ϵͳ�Ѱ�װ������������"
    Write-Host "�Ѱ�װ����������"
    $synthesizer.GetInstalledVoices() | ForEach-Object { Write-Host "- $($_.VoiceInfo.Name) ($($_.VoiceInfo.Culture))" }
}
$synthesizer.Rate = 0  # ���� (-10 �� 10)
$synthesizer.Volume = 100  # ���� (0 �� 100)

# ��ȡ�ű�����Ŀ¼�ľ���·��
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$audioRoot = Join-Path $projectRoot "public\audio"

# ������ƵĿ¼����������ڣ�
$dirs = @("numbers", "success", "streak", "fail")
foreach ($dir in $dirs) {
    $path = Join-Path $audioRoot $dir
    if (-not (Test-Path $path)) {
        Write-Host "����Ŀ¼��$path"
        New-Item -ItemType Directory -Path $path -Force
    } else {
        Write-Host "Ŀ¼�Ѵ��ڣ�$path"
    }
}

# ��֤Ŀ¼Ȩ��
try {
    $testFile = Join-Path $audioRoot "test.tmp"
    Set-Content -Path $testFile -Value "test" -ErrorAction Stop
    Remove-Item -Path $testFile -ErrorAction Stop
    Write-Host "Ŀ¼Ȩ����֤ͨ����$audioRoot"
} catch {
    Write-Host "�����޷���Ŀ¼�д����ļ�������Ȩ�����ã�$audioRoot"
    Write-Host "�������飺$($_.Exception.Message)"
    exit 1
}

# ����������Ƶ (1-9)
1..9 | ForEach-Object {
    $outputPath = Join-Path $audioRoot "numbers\$_.mp3"
    Write-Host "����������Ƶ��$_.mp3"
    try {
        $synthesizer.SetOutputToWaveFile($outputPath)
        $synthesizer.Speak([string]$_)
        $synthesizer.SetOutputToNull()
        if (Test-Path $outputPath) {
            Write-Host "? �ɹ����ɣ�$outputPath"
        } else {
            Write-Host "? ����ʧ�ܣ�$outputPath"
        }
    } catch {
        Write-Host "? ����ʧ�ܣ�$outputPath"
        Write-Host "�������飺$($_.Exception.Message)"
    }
}

# ���ɳɹ���ʾ����Ƶ
$successMessages = @{
    "great" = "̫���ˣ�";
    "excellent" = "����������";
    "perfect" = "������";
    "keepgoing" = "�������֣�";
    "wonderful" = "�ü��ˣ�";
    "youarethebest" = "��������ģ�";
}

foreach ($msg in $successMessages.GetEnumerator()) {
    $outputPath = Join-Path $audioRoot "success\$($msg.Key).mp3"
    try {
        $synthesizer.SetOutputToWaveFile($outputPath)
        $synthesizer.Speak($msg.Value)
        $synthesizer.SetOutputToNull()
        if (Test-Path $outputPath) {
            Write-Host "? �ɹ����ɣ�$outputPath"
        } else {
            Write-Host "? ����ʧ�ܣ�$outputPath"
        }
    } catch {
        Write-Host "? ����ʧ�ܣ�$outputPath"
        Write-Host "�������飺$($_.Exception.Message)"
    }
}

# ����������ʾ����Ƶ
$streakMessages = @{
    "consecutive" = "�����ɹ���";
    "winning" = "��ս��ʤ��";
    "unstoppable" = "��������";
    "invincible" = "�����ܵ���";
}

foreach ($msg in $streakMessages.GetEnumerator()) {
    $outputPath = Join-Path $audioRoot "streak\$($msg.Key).mp3"
    try {
        $synthesizer.SetOutputToWaveFile($outputPath)
        $synthesizer.Speak($msg.Value)
        $synthesizer.SetOutputToNull()
        if (Test-Path $outputPath) {
            Write-Host "? �ɹ����ɣ�$outputPath"
        } else {
            Write-Host "? ����ʧ�ܣ�$outputPath"
        }
    } catch {
        Write-Host "? ����ʧ�ܣ�$outputPath"
        Write-Host "�������飺$($_.Exception.Message)"
    }
}

# ����ʧ����ʾ����Ƶ
$failMessages = @{
    "choose_line" = "��ѡ��һ��ֱ���ϵ����֣�";
    "not_ten" = "��Щ���ּ�����������10Ŷ��";
}

foreach ($msg in $failMessages.GetEnumerator()) {
    $outputPath = Join-Path $audioRoot "fail\$($msg.Key).mp3"
    try {
        $synthesizer.SetOutputToWaveFile($outputPath)
        $synthesizer.Speak($msg.Value)
        $synthesizer.SetOutputToNull()
        if (Test-Path $outputPath) {
            Write-Host "? �ɹ����ɣ�$outputPath"
        } else {
            Write-Host "? ����ʧ�ܣ�$outputPath"
        }
    } catch {
        Write-Host "? ����ʧ�ܣ�$outputPath"
        Write-Host "�������飺$($_.Exception.Message)"
    }
}

Write-Host "������Ƶ�ļ�������ɣ�"