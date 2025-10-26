import os
import subprocess
import time
import logging
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import git


class GitRepositoryMonitor(FileSystemEventHandler):
    def __init__(self, api_client):
        self.api_client = api_client
        self.logger = logging.getLogger(__name__)
        self.monitored_repos = {}

    def detect_git_repositories(self, path):
        git_repos = []
        for root, dirs, files in os.walk(path):
            if '.git' in dirs:
                git_repos.append(root)
                dirs.remove('.git')
        return git_repos

    def monitor_git_operations(self):
        original_methods = {}

        def wrap_git_command(command_name, original_method):
            def wrapper(*args, **kwargs):
                repo_path = args[0].working_dir if hasattr(args[0], 'working_dir') else os.getcwd()

                self.log_activity({
                    'activityType': f'GIT_{command_name.upper()}',
                    'repository': os.path.basename(repo_path),
                    'details': {
                        'command': command_name,
                        'path': repo_path,
                        'timestamp': datetime.now().isoformat()
                    }
                })

                return original_method(*args, **kwargs)

            return wrapper

        return original_methods

    def check_repository_copy(self, src_path, dst_path):
        if os.path.exists(os.path.join(src_path, '.git')):
            self.logger.warning(f"Repository copy detected: {src_path} -> {dst_path}")

            self.log_activity({
                'activityType': 'REPO_COPY',
                'repository': os.path.basename(src_path),
                'details': {
                    'source': src_path,
                    'destination': dst_path,
                    'timestamp': datetime.now().isoformat()
                }
            })

            return True
        return False

    def watch_git_commands(self):
        self.logger.info("Starting git command monitoring...")

        git_commands = ['clone', 'pull', 'push', 'commit', 'checkout']

        for cmd in git_commands:
            self.monitor_command(cmd)

    def monitor_command(self, command):
        pass

    def log_activity(self, activity_data):
        try:
            self.api_client.log_activity(activity_data)
        except Exception as e:
            self.logger.error(f"Failed to log activity: {str(e)}")

    def on_created(self, event):
        if event.is_directory and os.path.exists(os.path.join(event.src_path, '.git')):
            self.logger.info(f"New git repository detected: {event.src_path}")

            self.log_activity({
                'activityType': 'GIT_CLONE',
                'repository': os.path.basename(event.src_path),
                'details': {
                    'path': event.src_path,
                    'timestamp': datetime.now().isoformat()
                }
            })

    def on_modified(self, event):
        if not event.is_directory:
            file_path = event.src_path

            for repo_path in self.monitored_repos:
                if file_path.startswith(repo_path):
                    self.check_uncommitted_changes(repo_path)

    def check_uncommitted_changes(self, repo_path):
        try:
            repo = git.Repo(repo_path)
            if repo.is_dirty(untracked_files=True):
                self.logger.debug(f"Uncommitted changes in: {repo_path}")
        except Exception as e:
            self.logger.error(f"Error checking repository: {str(e)}")

    def start_monitoring(self, paths):
        observer = Observer()

        for path in paths:
            if os.path.exists(path):
                repos = self.detect_git_repositories(path)
                for repo in repos:
                    self.monitored_repos[repo] = True

                observer.schedule(self, path, recursive=True)
                self.logger.info(f"Monitoring path: {path}")

        observer.start()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
            self.logger.info("Monitoring stopped")

        observer.join()
