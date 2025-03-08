# 设置脚本编码为UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 设置语音合成对象
Add-Type -AssemblyName System.Speech
$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer

# 设置语音参数
$voice = $synthesizer.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture -like 'zh-*' } | Select-Object -First 1
if ($voice) {
    Write-Host "找到中文语音：$($voice.VoiceInfo.Name)"
    $synthesizer.SelectVoice($voice.VoiceInfo.Name)
} else {
    Write-Host "警告：未找到中文语音，将使用默认语音。请确保系统已安装中文语音包。"
    Write-Host "已安装的语音包："
    $synthesizer.GetInstalledVoices() | ForEach-Object { Write-Host "- $($_.VoiceInfo.Name) ($($_.VoiceInfo.Culture))" }
}
$synthesizer.Rate = 0  # 语速 (-10 到 10)
$synthesizer.Volume = 100  # 音量 (0 到 100)

# 获取脚本所在目录的绝对路径
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$audioRoot = Join-Path $projectRoot "public\audio"

# 创建音频目录（如果不存在）
$dirs = @("numbers", "success", "streak", "fail")
foreach ($dir in $dirs) {
    $path = Join-Path $audioRoot $dir
    if (-not (Test-Path $path)) {
        Write-Host "创建目录：$path"
        New-Item -ItemType Directory -Path $path -Force
    } else {
        Write-Host "目录已存在：$path"
    }
}

# 验证目录权限
try {
    $testFile = Join-Path $audioRoot "test.tmp"
    Set-Content -Path $testFile -Value "test" -ErrorAction Stop
    Remove-Item -Path $testFile -ErrorAction Stop
    Write-Host "目录权限验证通过：$audioRoot"
} catch {
    Write-Host "错误：无法在目录中创建文件，请检查权限设置：$audioRoot"
    Write-Host "错误详情：$($_.Exception.Message)"
    exit 1
}

# 生成数字音频 (1-9)
1..9 | ForEach-Object {
    $outputPath = Join-Path $audioRoot "numbers\$_.mp3"
    Write-Host "生成数字音频：$_.mp3"
    try {
        $synthesizer.SetOutputToWaveFile($outputPath)
        $synthesizer.Speak([string]$_)
        $synthesizer.SetOutputToNull()
        if (Test-Path $outputPath) {
            Write-Host "? 成功生成：$outputPath"
        } else {
            Write-Host "? 生成失败：$outputPath"
        }
    } catch {
        Write-Host "? 生成失败：$outputPath"
        Write-Host "错误详情：$($_.Exception.Message)"
    }
}

# 生成成功提示语音频
$successMessages = @{
    "great" = "太棒了！";
    "excellent" = "你真厉害！";
    "perfect" = "完美！";
    "keepgoing" = "继续保持！";
    "wonderful" = "好极了！";
    "youarethebest" = "你是最棒的！";
}

foreach ($msg in $successMessages.GetEnumerator()) {
    $outputPath = Join-Path $audioRoot "success\$($msg.Key).mp3"
    try {
        $synthesizer.SetOutputToWaveFile($outputPath)
        $synthesizer.Speak($msg.Value)
        $synthesizer.SetOutputToNull()
        if (Test-Path $outputPath) {
            Write-Host "? 成功生成：$outputPath"
        } else {
            Write-Host "? 生成失败：$outputPath"
        }
    } catch {
        Write-Host "? 生成失败：$outputPath"
        Write-Host "错误详情：$($_.Exception.Message)"
    }
}

# 生成连击提示语音频
$streakMessages = @{
    "consecutive" = "连续成功！";
    "winning" = "连战连胜！";
    "unstoppable" = "势如破竹！";
    "invincible" = "无人能挡！";
}

foreach ($msg in $streakMessages.GetEnumerator()) {
    $outputPath = Join-Path $audioRoot "streak\$($msg.Key).mp3"
    try {
        $synthesizer.SetOutputToWaveFile($outputPath)
        $synthesizer.Speak($msg.Value)
        $synthesizer.SetOutputToNull()
        if (Test-Path $outputPath) {
            Write-Host "? 成功生成：$outputPath"
        } else {
            Write-Host "? 生成失败：$outputPath"
        }
    } catch {
        Write-Host "? 生成失败：$outputPath"
        Write-Host "错误详情：$($_.Exception.Message)"
    }
}

# 生成失败提示语音频
$failMessages = @{
    "choose_line" = "请选择一条直线上的数字！";
    "not_ten" = "这些数字加起来不等于10哦！";
}

foreach ($msg in $failMessages.GetEnumerator()) {
    $outputPath = Join-Path $audioRoot "fail\$($msg.Key).mp3"
    try {
        $synthesizer.SetOutputToWaveFile($outputPath)
        $synthesizer.Speak($msg.Value)
        $synthesizer.SetOutputToNull()
        if (Test-Path $outputPath) {
            Write-Host "? 成功生成：$outputPath"
        } else {
            Write-Host "? 生成失败：$outputPath"
        }
    } catch {
        Write-Host "? 生成失败：$outputPath"
        Write-Host "错误详情：$($_.Exception.Message)"
    }
}

Write-Host "所有音频文件生成完成！"